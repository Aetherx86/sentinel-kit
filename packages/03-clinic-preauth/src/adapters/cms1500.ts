import { validateIntakeAndPreAuth } from '../core/kernel.ts';
import type {
  ClinicalIntakeRecord,
  Cms1500PrecheckRecord,
  Cms1500ServiceLine24,
  ParsedEligibility271,
  PlanType,
  RelationshipCode,
  ValidationIssue
} from '../types.ts';

const BOX21_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

function toMmddyyyy(isoDate: string): string {
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  return `${m[2]}${m[3]}${m[1]}`;
}

function mapProgramType(planType: PlanType): Cms1500PrecheckRecord['boxes']['box1ProgramType'] {
  switch (planType) {
    case 'MEDICARE':
      return 'MEDICARE';
    case 'MEDICAID':
      return 'MEDICAID';
    case 'TRICARE':
      return 'TRICARE';
    case 'PPO':
    case 'HMO':
    case 'EPO':
    case 'POS':
    case 'COMMERCIAL':
      return 'GROUP_HEALTH_PLAN';
    default:
      return 'OTHER';
  }
}

function mapRelationship(rel: RelationshipCode): Cms1500PrecheckRecord['boxes']['box6PatientRelationshipToInsured'] {
  switch (rel) {
    case '18':
      return 'SELF';
    case '01':
      return 'SPOUSE';
    case '19':
      return 'CHILD';
    default:
      return 'OTHER';
  }
}

function formatCmsName(last: string, first: string, middle?: string): string {
  const l = last.trim().toUpperCase();
  const f = first.trim().toUpperCase();
  const mi = middle ? middle.trim().toUpperCase().slice(0, 1) : '';
  return mi ? `${l}, ${f} ${mi}` : `${l}, ${f}`;
}

function normalizeAlphaNum(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function generateCms1500Precheck(
  intake: ClinicalIntakeRecord,
  eligibility?: ParsedEligibility271
): Cms1500PrecheckRecord {
  const kernelResult = validateIntakeAndPreAuth(intake);
  const blockers: ValidationIssue[] = kernelResult.issues.filter((i) => i.severity === 'BLOCKER');

  if (eligibility) {
    if (!eligibility.activeCoverage) {
      const aaaDetail =
        eligibility.aaaRejections.length > 0
          ? ` (AAA ${eligibility.aaaRejections.map((r) => `${r.rejectReasonCode}: ${r.rejectReasonDescription}`).join('; ')})`
          : '';
      blockers.push({
        code: 'CMS1500_ELIGIBILITY_INACTIVE',
        severity: 'BLOCKER',
        field: 'coverage.memberId',
        message: `271 response status is ${eligibility.coverageStatus}${aaaDetail}`,
        remediation: 'Verify active subscriber policy or collect secondary payer before claim transmission'
      });
    }

    if (
      eligibility.subscriberMemberId &&
      normalizeAlphaNum(eligibility.subscriberMemberId) !== normalizeAlphaNum(intake.coverage.memberId)
    ) {
      blockers.push({
        code: 'CMS1500_BOX1A_271_MISMATCH',
        severity: 'BLOCKER',
        field: 'boxes.box1aInsuredIdNumber',
        message: 'Box 1a Insured ID does not match subscriber ID returned in 271 response',
        remediation: 'Align Box 1a with payer-confirmed subscriber member ID'
      });
    }

    if (eligibility.priorAuthRequired && (!intake.priorAuthNumber || intake.priorAuthNumber.trim().length < 5)) {
      const alreadyFlagged = blockers.some((b) => b.code === 'PRIOR_AUTH_REQUIRED_MISSING');
      if (!alreadyFlagged) {
        blockers.push({
          code: 'CMS1500_BOX23_271_AUTH_REQUIRED',
          severity: 'BLOCKER',
          field: 'boxes.box23PriorAuthNumber',
          message: 'Payer 271 benefit segment indicates prior authorization is required (EB11=Y) and Box 23 is blank',
          remediation: 'Populate Box 23 with approved authorization number before claim submission'
        });
      }
    }
  }

  if (intake.patient.gender !== 'M' && intake.patient.gender !== 'F') {
    blockers.push({
      code: 'CMS1500_BOX3_SEX_REQUIRED',
      severity: 'BLOCKER',
      field: 'boxes.box3PatientSex',
      message: 'CMS-1500 (02/12) Box 3 requires administrative sex M or F for clearinghouse acceptance',
      remediation: 'Confirm subscriber-file administrative sex code (M or F)'
    });
  }

  if (!/^[A-Z]{2}$/.test(intake.patient.state.trim().toUpperCase())) {
    blockers.push({
      code: 'CMS1500_BOX5_STATE_INVALID',
      severity: 'BLOCKER',
      field: 'boxes.box5PatientAddress.state',
      message: 'Box 5 patient state must be a 2-letter US postal code',
      remediation: 'Set 2-letter state abbreviation in patient demographics'
    });
  }

  if (!/^\d{5}(-\d{4}|\d{4})?$/.test(intake.patient.postalCode.trim())) {
    blockers.push({
      code: 'CMS1500_BOX5_ZIP_INVALID',
      severity: 'BLOCKER',
      field: 'boxes.box5PatientAddress.zip',
      message: 'Box 5 patient ZIP code must be 5 or 9 digits',
      remediation: 'Format patient postal code as 5-digit or ZIP+4'
    });
  }

  // CMS-1500 (02/12) Box 21 supports at most 12 ICD-10-CM codes (A through L).
  if (intake.diagnosisCodes.length > 12) {
    blockers.push({
      code: 'CMS1500_BOX21_MAX_12_EXCEEDED',
      severity: 'BLOCKER',
      field: 'boxes.box21Diagnoses',
      message: `Encounter includes ${intake.diagnosisCodes.length} diagnoses; CMS-1500 Box 21 allows at most 12 (A-L)`,
      remediation: 'Retain up to 12 primary/secondary ICD-10-CM diagnoses referenced by service lines'
    });
  }

  const box21Diagnoses: Record<string, string> = {};
  for (let i = 0; i < Math.min(intake.diagnosisCodes.length, 12); i++) {
    box21Diagnoses[BOX21_LETTERS[i]] = intake.diagnosisCodes[i].trim().toUpperCase();
  }

  const box24ServiceLines: Cms1500ServiceLine24[] = [];
  let totalChargeCents = 0;

  for (let idx = 0; idx < intake.serviceLines.length; idx++) {
    const line = intake.serviceLines[idx];
    const lineNum = line.lineNumber ?? idx + 1;
    const dos = toMmddyyyy(line.serviceDate ?? intake.dateOfService);
    const pos = (line.placeOfService ?? intake.placeOfService).trim().padStart(2, '0');
    const cleanModifiers = line.modifiers.map((m) => m.trim().toUpperCase()).filter(Boolean);

    if (cleanModifiers.length > 4) {
      blockers.push({
        code: 'CMS1500_BOX24D_MAX_4_MODIFIERS',
        severity: 'BLOCKER',
        field: `boxes.box24ServiceLines[${idx}].box24dModifiers`,
        message: 'Box 24D supports at most 4 CPT/HCPCS modifiers per service line',
        remediation: 'Limit line modifiers to the 4 highest-priority payment/pricing modifiers'
      });
    }

    const pointerLetters: string[] = [];
    let pointerInvalid = line.diagnosisPointers.length === 0 || line.diagnosisPointers.length > 4;
    for (const ptr of line.diagnosisPointers) {
      if (!Number.isInteger(ptr) || ptr < 1 || ptr > 12 || !box21Diagnoses[BOX21_LETTERS[ptr - 1]]) {
        pointerInvalid = true;
      } else {
        const letter = BOX21_LETTERS[ptr - 1];
        if (!pointerLetters.includes(letter)) {
          pointerLetters.push(letter);
        }
      }
    }

    if (pointerInvalid) {
      blockers.push({
        code: 'CMS1500_BOX24E_POINTER_INVALID',
        severity: 'BLOCKER',
        field: `boxes.box24ServiceLines[${idx}].box24eDiagnosisPointer`,
        message: 'Box 24E requires 1 to 4 valid diagnosis pointer letters matching populated Box 21A-L slots',
        remediation: 'Map service line diagnosisPointers to populated 1-based Box 21 slots (max 4 per line)'
      });
    }

    const lineCents = Math.round(line.chargeAmount * 100);
    if (!Number.isFinite(lineCents) || lineCents <= 0) {
      blockers.push({
        code: 'CMS1500_BOX24F_NONPOSITIVE_CHARGE',
        severity: 'BLOCKER',
        field: `boxes.box24ServiceLines[${idx}].box24fCharges`,
        message: 'Box 24F line charge must be greater than 0.00',
        remediation: 'Enter positive fee-schedule charge amount for service line'
      });
    } else {
      totalChargeCents += lineCents;
    }

    if (!Number.isFinite(line.units) || line.units <= 0) {
      blockers.push({
        code: 'CMS1500_BOX24G_INVALID_UNITS',
        severity: 'BLOCKER',
        field: `boxes.box24ServiceLines[${idx}].box24gDaysOrUnits`,
        message: 'Box 24G days/units must be positive',
        remediation: 'Specify positive service unit count'
      });
    }

    box24ServiceLines.push({
      lineNumber: lineNum,
      box24aDateFrom: dos,
      box24aDateTo: dos,
      box24bPlaceOfService: pos,
      box24cEmg: '',
      box24dCptHcpcs: line.cptCode.trim().toUpperCase(),
      box24dModifiers: cleanModifiers.slice(0, 4),
      box24eDiagnosisPointer: pointerLetters.slice(0, 4).join(''),
      box24fCharges: lineCents / 100,
      box24gDaysOrUnits: line.units,
      box24iIdQualifier: '  ',
      box24jRenderingNpi: intake.provider.renderingNpi.replace(/\D/g, '')
    });
  }

  const taxDigits = intake.provider.taxId.replace(/\D/g, '');
  if (taxDigits.length !== 9) {
    blockers.push({
      code: 'CMS1500_BOX25_INVALID_TAX_ID',
      severity: 'BLOCKER',
      field: 'boxes.box25FederalTaxId',
      message: 'Box 25 Federal Tax ID must contain 9 digits (EIN or SSN)',
      remediation: 'Set 9-digit billing TIN in provider profile'
    });
  }

  const taxonomy = intake.provider.taxonomyCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{9}X$/.test(taxonomy)) {
    blockers.push({
      code: 'CMS1500_BOX33B_INVALID_TAXONOMY',
      severity: 'BLOCKER',
      field: 'boxes.box33BillingProvider.taxonomyCode',
      message: 'Box 33b NUCC provider taxonomy code must be 10 alphanumeric characters ending in X',
      remediation: 'Assign valid 10-character NUCC provider taxonomy code (e.g. 207Q00000X, 225100000X)'
    });
  }

  const totalCharge = totalChargeCents / 100;
  let estimatedPatientResponsibility: number | null = null;
  if (eligibility && eligibility.activeCoverage && totalCharge > 0) {
    const dedRem = eligibility.deductibleRemaining ?? 0;
    const copay = eligibility.copayAmount ?? 0;
    const coins = eligibility.coinsuranceRate ?? 0;
    const appliedDeductible = Math.min(totalCharge, dedRem);
    const afterDeductible = Math.max(0, totalCharge - appliedDeductible);
    const coinsShare = afterDeductible * coins;
    const rawEst = Math.min(totalCharge, appliedDeductible + copay + coinsShare);
    estimatedPatientResponsibility = Math.round(rawEst * 100) / 100;
  }

  const insuredName =
    intake.coverage.relationshipToSubscriber === '18'
      ? 'SAME'
      : formatCmsName(
          intake.coverage.subscriberLastName ?? intake.patient.lastName,
          intake.coverage.subscriberFirstName ?? ''
        );

  const facilityCityStateZip = `${intake.provider.facilityCity.trim().toUpperCase()}, ${intake.provider.facilityState.trim().toUpperCase()} ${intake.provider.facilityPostalCode.trim()}`;

  return {
    formVersion: '02/12',
    claimReady: blockers.length === 0,
    boxes: {
      box1ProgramType: mapProgramType(intake.coverage.planType),
      box1aInsuredIdNumber: intake.coverage.memberId.trim().toUpperCase(),
      box2PatientName: formatCmsName(
        intake.patient.lastName,
        intake.patient.firstName,
        intake.patient.middleName
      ),
      box3PatientDob: toMmddyyyy(intake.patient.dob),
      box3PatientSex: intake.patient.gender === 'F' ? 'F' : 'M',
      box4InsuredName: insuredName,
      box5PatientAddress: {
        street: [intake.patient.addressLine1, intake.patient.addressLine2]
          .filter(Boolean)
          .join(' ')
          .trim()
          .toUpperCase(),
        city: intake.patient.city.trim().toUpperCase(),
        state: intake.patient.state.trim().toUpperCase(),
        zip: intake.patient.postalCode.trim(),
        phone: intake.patient.phone
      },
      box6PatientRelationshipToInsured: mapRelationship(intake.coverage.relationshipToSubscriber),
      box11InsuredPolicyGroupNumber: intake.coverage.groupNumber?.trim().toUpperCase() || 'NONE',
      box11dAnotherHealthBenefitPlan: false,
      box17ReferringProviderName: intake.provider.referringName
        ? `DN ${intake.provider.referringName.trim().toUpperCase()}`
        : '',
      box17bReferringProviderNpi: intake.provider.referringNpi?.replace(/\D/g, '') ?? '',
      box21DiagnosisNatureIndicator: '0',
      box21Diagnoses,
      box23PriorAuthNumber: intake.priorAuthNumber?.trim().toUpperCase() ?? '',
      box24ServiceLines,
      box25FederalTaxId: taxDigits,
      box25TaxIdType: intake.provider.taxIdType ?? 'EIN',
      box26PatientAccountNumber: (intake.patient.accountNumber ?? intake.intakeId)
        .trim()
        .toUpperCase()
        .slice(0, 14),
      box27AcceptAssignment: true,
      box28TotalCharge: totalCharge,
      box29AmountPaid: 0,
      box31SignatureOfPhysician: 'SIGNATURE ON FILE',
      box32ServiceFacilityLocation: {
        name: (intake.provider.facilityName ?? intake.provider.organizationName).trim().toUpperCase(),
        address: intake.provider.facilityAddressLine1.trim().toUpperCase(),
        cityStateZip: facilityCityStateZip,
        npi: intake.provider.billingNpi.replace(/\D/g, '')
      },
      box33BillingProvider: {
        name: intake.provider.organizationName.trim().toUpperCase(),
        address: intake.provider.facilityAddressLine1.trim().toUpperCase(),
        cityStateZip: facilityCityStateZip,
        npi: intake.provider.billingNpi.replace(/\D/g, ''),
        taxonomyQualifier: 'ZZ',
        taxonomyCode: taxonomy
      }
    },
    estimatedPatientResponsibility,
    clearinghouseBlockers: blockers
  };
}
