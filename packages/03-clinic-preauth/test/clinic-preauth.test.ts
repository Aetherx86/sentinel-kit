import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  buildX12Eligibility270,
  generateCms1500Precheck,
  normalizeExtensionCapture,
  parseX12Eligibility271,
  signIntakeWebhook,
  validateIntakeAndPreAuth,
  validateNpiLuhn,
  verifyIntakeWebhook
} from '../src/index.ts';
import { runCli } from '../src/cli.ts';
import type { ClinicalIntakeRecord } from '../src/types.ts';

function makeValidIntake(overrides?: Partial<ClinicalIntakeRecord>): ClinicalIntakeRecord {
  const base: ClinicalIntakeRecord = {
    intakeId: 'INTK-20260410-001',
    receivedAt: '2026-04-12',
    dateOfService: '2026-04-10',
    placeOfService: '11',
    patient: {
      firstName: 'Elena',
      lastName: 'Vance',
      middleName: 'R',
      dob: '1984-07-19',
      gender: 'F',
      addressLine1: '412 Congress Ave',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      phone: '5125550148',
      accountNumber: 'ACCT88412'
    },
    coverage: {
      memberId: 'BCBS94827163',
      groupNumber: 'GRP77410',
      payerId: '84980',
      payerName: 'Blue Cross Blue Shield TX',
      planType: 'PPO',
      relationshipToSubscriber: '18'
    },
    provider: {
      billingNpi: '1234567893',
      renderingNpi: '1245319599',
      referringNpi: '1679576722',
      referringName: 'Marcus Sterling MD',
      organizationName: 'Lone Star Outpatient Rehab PLLC',
      taxId: '74-3198421',
      taxIdType: 'EIN',
      taxonomyCode: '225100000X',
      facilityName: 'Lone Star Central Clinic',
      facilityAddressLine1: '900 Cesar Chavez St',
      facilityCity: 'Austin',
      facilityState: 'TX',
      facilityPostalCode: '78702',
      specialty: 'PHYSICAL_THERAPY'
    },
    diagnosisCodes: ['M25.561', 'M54.50'],
    serviceLines: [
      {
        lineNumber: 1,
        cptCode: '97110',
        modifiers: ['GP'],
        diagnosisPointers: [1, 2],
        units: 2,
        chargeAmount: 150.0
      }
    ]
  };
  return { ...base, ...overrides };
}

describe('03-clinic-preauth: NPI, MBI, ICD-10, CPT/NCCI, X12 270/271, CMS-1500, and Extension Bridge', () => {
  it('1. validates 10-digit NPI numbers with ISO 80840 Luhn mod-10 prefix rules', () => {
    assert.equal(validateNpiLuhn('1234567893'), true);
    assert.equal(validateNpiLuhn('1245319599'), true);
    assert.equal(validateNpiLuhn('2012345676'), true);
    assert.equal(validateNpiLuhn('1234567890'), false);
    assert.equal(validateNpiLuhn('3234567899'), false);
    assert.equal(validateNpiLuhn('123456789'), false);
    assert.equal(validateNpiLuhn('12345A7893'), false);

    const badNpiIntake = makeValidIntake({
      provider: {
        ...makeValidIntake().provider,
        billingNpi: '1234567890',
        renderingNpi: '1245319590'
      }
    });
    const res = validateIntakeAndPreAuth(badNpiIntake);
    assert.equal(res.valid, false);
    assert.equal(res.npiValid.billing, false);
    assert.equal(res.npiValid.rendering, false);
    assert.ok(res.issues.some((i) => i.code === 'NPI_BILLING_INVALID'));
    assert.ok(res.issues.some((i) => i.code === 'NPI_RENDERING_INVALID'));
  });

  it('2. enforces Medicare 11-character MBI charset mask and commercial member ID checks', () => {
    const validMedicare = makeValidIntake({
      coverage: {
        ...makeValidIntake().coverage,
        planType: 'MEDICARE',
        memberId: '1EG4-TE5-MK72'
      }
    });
    const okRes = validateIntakeAndPreAuth(validMedicare);
    assert.equal(okRes.valid, true);
    assert.equal(okRes.memberIdValid, true);

    // Character 'S' and 'O' are prohibited in CMS MBI specification
    const badMbi = makeValidIntake({
      coverage: {
        ...makeValidIntake().coverage,
        planType: 'MEDICARE',
        memberId: '1SG4TO5MK72'
      }
    });
    const badRes = validateIntakeAndPreAuth(badMbi);
    assert.equal(badRes.valid, false);
    assert.equal(badRes.memberIdValid, false);
    assert.ok(badRes.issues.some((i) => i.code === 'MBI_FORMAT_INVALID'));
  });

  it('3. builds compliant ANSI X12 005010X279A1 270 eligibility inquiries with exact ISA width and SE counts', () => {
    const intake = makeValidIntake();
    const built = buildX12Eligibility270(intake, {
      senderId: 'LONESTARPT',
      receiverId: '84980',
      interchangeControlNumber: '42',
      groupControlNumber: '7',
      transactionControlNumber: '19',
      timestamp: '2026-04-10T14:30:00Z'
    });

    assert.equal(built.interchangeControlNumber, '000000042');
    assert.equal(built.transactionControlNumber, '0019');

    const firstTilde = built.edi.indexOf('~');
    assert.equal(firstTilde, 105);

    const segments = built.edi.split('~').filter(Boolean);
    assert.equal(segments.length, built.segmentCount);
    assert.ok(segments[0].startsWith('ISA*00*'));
    assert.ok(segments[1].startsWith('GS*HS*LONESTARPT*84980*20260410*1430*7*X*005010X279A1'));
    assert.equal(segments[2], 'ST*270*0019*005010X279A1');

    const seSeg = segments.find((s) => s.startsWith('SE*'))!;
    assert.equal(seSeg, `SE*${built.transactionSegmentCount}*0019`);
    assert.equal(built.segmentCount, built.transactionSegmentCount + 4);
    assert.ok(segments.some((s) => s === 'DMG*D8*19840719*F'));
    assert.ok(segments.some((s) => s === 'DTP*291*D8*20260410'));
    assert.ok(segments.some((s) => s === 'EQ*30'));
    assert.ok(segments.some((s) => s === 'EQ*AE'));
  });

  it('4. builds Loop 2000D dependent hierarchy when patient is a child dependent', () => {
    const depIntake = makeValidIntake({
      patient: {
        ...makeValidIntake().patient,
        firstName: 'Liam',
        dob: '2014-05-10',
        gender: 'M'
      },
      coverage: {
        ...makeValidIntake().coverage,
        relationshipToSubscriber: '19',
        subscriberFirstName: 'Elena',
        subscriberLastName: 'Vance',
        subscriberDob: '1984-07-19',
        subscriberGender: 'F'
      }
    });

    const built = buildX12Eligibility270(depIntake, {
      senderId: 'LONESTARPT',
      receiverId: '84980'
    });
    assert.ok(built.edi.includes('~HL*3*2*22*1~'));
    assert.ok(built.edi.includes('~HL*4*3*23*0~'));
    assert.ok(built.edi.includes('~INS*N*19~'));
  });

  it('5. parses X12 271 active coverage, copay, coinsurance, deductible remaining, and prior-auth flags', () => {
    const raw271 = [
      'ISA*00*          *00*          *ZZ*84980          *ZZ*LONESTARPT     *260410*1431*^*00501*000000042*0*P*:~',
      'GS*HB*84980*LONESTARPT*20260410*1431*7*X*005010X279A1~',
      'ST*271*0019*005010X279A1~',
      'BHT*0022*11*RESP99812*20260410*1431~',
      'HL*1**20*1~',
      'NM1*PR*2*BLUE CROSS BLUE SHIELD TX*****PI*84980~',
      'HL*2*1*21*1~',
      'NM1*1P*2*LONE STAR OUTPATIENT REHAB PLLC*****XX*1234567893~',
      'HL*3*2*22*0~',
      'TRN*2*INTK-20260410-001*9849800000~',
      'NM1*IL*1*VANCE*ELENA*R***MI*BCBS94827163~',
      'EB*1*IND*30*PR*BLUE CHOICE PPO~',
      'EB*B*IND*AE***27*35.00*****Y~',
      'EB*A*IND*AE*****.20****Y~',
      'EB*C*IND*30***23*1500.00*****Y~',
      'EB*C*IND*30***29*420.50*****Y~',
      'EB*G*IND*30***29*2100.00*****Y~',
      'EB*1*IND*73********Y*Y~',
      'SE*17*0019~',
      'GE*1*7~',
      'IEA*1*000000042~'
    ].join('\n');

    const parsed = parseX12Eligibility271(raw271);
    assert.equal(parsed.sourceFormat, 'X12_271');
    assert.equal(parsed.activeCoverage, true);
    assert.equal(parsed.coverageStatus, 'ACTIVE');
    assert.equal(parsed.subscriberMemberId, 'BCBS94827163');
    assert.equal(parsed.copayAmount, 35);
    assert.equal(parsed.coinsuranceRate, 0.2);
    assert.equal(parsed.deductibleTotal, 1500);
    assert.equal(parsed.deductibleRemaining, 420.5);
    assert.equal(parsed.outOfPocketRemaining, 2100);
    assert.equal(parsed.priorAuthRequired, true);
    assert.deepEqual(parsed.priorAuthServiceTypes, ['73']);
  });

  it('6. parses X12 271 AAA rejection segments (72 Invalid Member ID, 75 Subscriber Not Found) and JSON clearinghouse envelopes', () => {
    const rejected271 = [
      'ST*271*0088*005010X279A1~',
      'BHT*0022*11*ERR551*20260410*1435~',
      'HL*1**20*1~',
      'NM1*PR*2*UNITEDHEALTHCARE*****PI*87726~',
      'HL*2*1*21*1~',
      'NM1*1P*2*LONE STAR OUTPATIENT REHAB PLLC*****XX*1234567893~',
      'HL*3*2*22*0~',
      'NM1*IL*1*VANCE*ELENA****MI*BADID00~',
      'AAA*N**72*C~',
      'AAA*N**75*N~',
      'SE*11*0088~'
    ].join('');

    const parsed = parseX12Eligibility271(rejected271);
    assert.equal(parsed.activeCoverage, false);
    assert.equal(parsed.coverageStatus, 'REJECTED');
    assert.equal(parsed.aaaRejections.length, 2);
    assert.equal(parsed.aaaRejections[0].rejectReasonCode, '72');
    assert.match(parsed.aaaRejections[0].rejectReasonDescription, /subscriber\/insured ID/i);
    assert.equal(parsed.aaaRejections[1].rejectReasonCode, '75');
    assert.match(parsed.aaaRejections[1].rejectReasonDescription, /not found/i);

    const jsonParsed = parseX12Eligibility271({
      controlNumber: '9912',
      payer: { name: 'AETNA', id: '60054' },
      subscriber: { memberId: 'W192837465', firstName: 'Elena', lastName: 'Vance' },
      benefitsInformation: [
        { code: '1', serviceTypeCodes: ['30'], inPlanNetworkIndicatorCode: 'Y' },
        { code: 'B', serviceTypeCodes: ['98'], timeQualifierCode: '27', benefitAmount: '25', inPlanNetworkIndicatorCode: 'Y' },
        { code: 'C', serviceTypeCodes: ['30'], timeQualifierCode: '29', benefitAmount: '250.00', inPlanNetworkIndicatorCode: 'Y' }
      ]
    });
    assert.equal(jsonParsed.sourceFormat, 'NORMALIZED_JSON');
    assert.equal(jsonParsed.activeCoverage, true);
    assert.equal(jsonParsed.copayAmount, 25);
    assert.equal(jsonParsed.deductibleRemaining, 250);
  });

  it('7. flags NCCI unbundled CPT pairs without modifier 59 and passes when modifier 59 is appended', () => {
    const unbundled = makeValidIntake({
      serviceLines: [
        { cptCode: '97530', modifiers: ['GP'], diagnosisPointers: [1], units: 1, chargeAmount: 85 },
        { cptCode: '97140', modifiers: ['GP'], diagnosisPointers: [1], units: 1, chargeAmount: 75 }
      ]
    });
    const failRes = validateIntakeAndPreAuth(unbundled);
    assert.equal(failRes.valid, false);
    assert.ok(failRes.issues.some((i) => i.code === 'NCCI_UNBUNDLED_CONFLICT'));

    const distinctWith59 = makeValidIntake({
      serviceLines: [
        { cptCode: '97530', modifiers: ['GP'], diagnosisPointers: [1], units: 1, chargeAmount: 85 },
        { cptCode: '97140', modifiers: ['GP', '59'], diagnosisPointers: [1], units: 1, chargeAmount: 75 }
      ]
    });
    const passRes = validateIntakeAndPreAuth(distinctWith59);
    assert.equal(passRes.valid, true);

    // Indicator-0 mutually exclusive psychotherapy codes cannot be overridden even with modifier 59
    const indicatorZero = makeValidIntake({
      provider: {
        ...makeValidIntake().provider,
        specialty: 'BEHAVIORAL_HEALTH',
        taxonomyCode: '103TC0700X'
      },
      diagnosisCodes: ['F41.1'],
      serviceLines: [
        { cptCode: '90834', modifiers: [], diagnosisPointers: [1], units: 1, chargeAmount: 140 },
        { cptCode: '90837', modifiers: ['59'], diagnosisPointers: [1], units: 1, chargeAmount: 180 }
      ]
    });
    const ind0Res = validateIntakeAndPreAuth(indicatorZero);
    assert.equal(ind0Res.valid, false);
    assert.ok(ind0Res.issues.some((i) => i.code === 'NCCI_MUTUALLY_EXCLUSIVE_PAIR'));
  });

  it('8. requires GP/GO/GN plan-of-care modifier on rehabilitation therapy CPT ranges', () => {
    const missingTherapyMod = makeValidIntake({
      serviceLines: [
        { cptCode: '97110', modifiers: [], diagnosisPointers: [1], units: 2, chargeAmount: 150 }
      ]
    });
    const res = validateIntakeAndPreAuth(missingTherapyMod);
    assert.equal(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'MODIFIER_THERAPY_REQUIRED'));
  });

  it('9. rejects malformed, truncated, or unspecified-laterality ICD-10-CM diagnosis codes', () => {
    const badDiagnoses = makeValidIntake({
      diagnosisCodes: ['M54', 'M25.569', 'S83.51', '999.00']
    });
    const res = validateIntakeAndPreAuth(badDiagnoses);
    assert.equal(res.valid, false);
    const specificityErrors = res.issues.filter((i) => i.code === 'ICD10_INSUFFICIENT_SPECIFICITY');
    const syntaxErrors = res.issues.filter((i) => i.code === 'ICD10_SYNTAX_INVALID');
    assert.equal(specificityErrors.length, 3);
    assert.equal(syntaxErrors.length, 1);
  });

  it('10. enforces prior-authorization matrix and HMO timely-filing windows', () => {
    const mriNoAuth = makeValidIntake({
      receivedAt: '2026-08-01',
      dateOfService: '2026-04-10',
      coverage: {
        ...makeValidIntake().coverage,
        planType: 'HMO'
      },
      provider: {
        ...makeValidIntake().provider,
        specialty: 'RADIOLOGY',
        taxonomyCode: '2085R0202X'
      },
      serviceLines: [
        { cptCode: '73721', modifiers: [], diagnosisPointers: [1], units: 1, chargeAmount: 650 }
      ]
    });
    const blocked = validateIntakeAndPreAuth(mriNoAuth);
    assert.equal(blocked.valid, false);
    assert.equal(blocked.requiresPriorAuth, true);
    assert.ok(blocked.timelyFilingRemainingDays < 0);
    assert.ok(blocked.issues.some((i) => i.code === 'PRIOR_AUTH_REQUIRED_MISSING'));
    assert.ok(blocked.issues.some((i) => i.code === 'TIMELY_FILING_EXCEEDED'));

    const mriWithAuthOnTime = makeValidIntake({
      priorAuthNumber: 'PA-TX-994821',
      provider: {
        ...makeValidIntake().provider,
        specialty: 'RADIOLOGY',
        taxonomyCode: '2085R0202X'
      },
      serviceLines: [
        { cptCode: '73721', modifiers: [], diagnosisPointers: [1], units: 1, chargeAmount: 650 }
      ]
    });
    const approved = validateIntakeAndPreAuth(mriWithAuthOnTime);
    assert.equal(approved.valid, true);
    assert.equal(approved.requiresPriorAuth, true);
    assert.equal(approved.lineDecisions[0].satisfied, true);
  });

  it('11. validates E/M modifier 25 pairing and telehealth POS/modifier rules', () => {
    const emPlusInjectionNo25 = makeValidIntake({
      provider: {
        ...makeValidIntake().provider,
        specialty: 'ORTHOPEDICS',
        taxonomyCode: '207X00000X'
      },
      serviceLines: [
        { cptCode: '99214', modifiers: [], diagnosisPointers: [1], units: 1, chargeAmount: 185 },
        { cptCode: '20610', modifiers: [], diagnosisPointers: [1], units: 1, chargeAmount: 140 }
      ]
    });
    const no25Res = validateIntakeAndPreAuth(emPlusInjectionNo25);
    assert.equal(no25Res.valid, false);
    assert.ok(no25Res.issues.some((i) => i.code === 'MODIFIER_25_REQUIRED_WITH_PROCEDURE'));

    const teleHandsOn = makeValidIntake({
      placeOfService: '02',
      serviceLines: [
        { cptCode: '97140', modifiers: ['GP', '95'], diagnosisPointers: [1], units: 1, chargeAmount: 75 }
      ]
    });
    const teleRes = validateIntakeAndPreAuth(teleHandsOn);
    assert.equal(teleRes.valid, false);
    assert.ok(teleRes.issues.some((i) => i.code === 'TELEHEALTH_MODIFIER_OR_CPT_CONFLICT'));
  });

  it('12. generates CMS-1500 (02/12) claim pre-check with Box 21/24E pointer integrity and patient share calculation', () => {
    const intake = makeValidIntake({
      serviceLines: [
        { cptCode: '97110', modifiers: ['GP'], diagnosisPointers: [1, 2], units: 2, chargeAmount: 160.25 },
        { cptCode: '97140', modifiers: ['GP', '59'], diagnosisPointers: [1], units: 1, chargeAmount: 79.75 }
      ]
    });
    const elig = parseX12Eligibility271({
      controlNumber: '1001',
      payer: { name: 'BCBS TX', id: '84980' },
      subscriber: { memberId: 'BCBS94827163', firstName: 'Elena', lastName: 'Vance' },
      benefitsInformation: [
        { code: '1', serviceTypeCodes: ['30'], inPlanNetworkIndicatorCode: 'Y' },
        { code: 'B', serviceTypeCodes: ['AE'], timeQualifierCode: '27', benefitAmount: '30', inPlanNetworkIndicatorCode: 'Y' },
        { code: 'A', serviceTypeCodes: ['AE'], benefitPercent: '0.20', inPlanNetworkIndicatorCode: 'Y' },
        { code: 'C', serviceTypeCodes: ['30'], timeQualifierCode: '29', benefitAmount: '100', inPlanNetworkIndicatorCode: 'Y' }
      ]
    });

    const cms = generateCms1500Precheck(intake, elig);
    assert.equal(cms.formVersion, '02/12');
    assert.equal(cms.claimReady, true);
    assert.equal(cms.boxes.box21Diagnoses.A, 'M25.561');
    assert.equal(cms.boxes.box21Diagnoses.B, 'M54.50');
    assert.equal(cms.boxes.box24ServiceLines[0].box24eDiagnosisPointer, 'AB');
    assert.equal(cms.boxes.box24ServiceLines[1].box24eDiagnosisPointer, 'A');
    assert.equal(cms.boxes.box28TotalCharge, 240);
    // $100 deductible + $30 copay + 20% of ($240 - $100 = $140 -> $28) = $158.00
    assert.equal(cms.estimatedPatientResponsibility, 158);

    const brokenPointerIntake = makeValidIntake({
      serviceLines: [
        { cptCode: '97110', modifiers: ['GP'], diagnosisPointers: [4], units: 1, chargeAmount: 80 }
      ]
    });
    const brokenCms = generateCms1500Precheck(brokenPointerIntake);
    assert.equal(brokenCms.claimReady, false);
    assert.ok(brokenCms.clearinghouseBlockers.some((b) => b.code === 'CMS1500_BOX24E_POINTER_INVALID'));
  });

  it('13. normalizes EHR Chrome extension DOM captures and verifies HMAC-SHA256 signed webhooks', () => {
    const normalized = normalizeExtensionCapture({
      pageUrl: 'https://my.simplepractice.com/clients/9921/billing',
      capturedAt: '2026-04-10T16:20:00Z',
      fields: {
        csrf_token: 'secret-dom-csrf-9999',
        _reactFiberKey: 'internal-node',
        intercom_session: 'ic-88271',
        ui_theme: 'light',
        appointment_id: 'SP-APT-4410',
        session_date: '04/10/2026',
        pos_code: '02',
        client_first_name: 'Nora',
        client_last_name: 'Bell',
        client_dob: '11/03/1991',
        client_sex: 'F',
        client_state: 'TX',
        client_zip: '78704',
        insurance_member_id: 'UHC88392011',
        clearinghouse_payer_id: '87726',
        insurance_payer: 'UnitedHealthcare',
        insurance_plan_type: 'PPO',
        billing_npi: '1234567893',
        clinician_npi: '1245319599',
        clinic_ein: '74-3198421',
        provider_taxonomy: '103TC0700X',
        icd10_diagnoses: 'F41.1, Z63.0',
        cpt_code_1: '90837',
        modifiers_1: '95',
        units_1: '1',
        charge_1: '175.00',
        dx_pointers_1: '1,2'
      }
    });

    assert.equal(normalized.provider.specialty, 'BEHAVIORAL_HEALTH');
    assert.equal(normalized.patient.dob, '1991-11-03');
    assert.equal(normalized.dateOfService, '2026-04-10');
    const val = validateIntakeAndPreAuth(normalized);
    assert.equal(val.valid, true);

    const secret = 'whsec_clinic_bridge_test_key_2026';
    const signed = signIntakeWebhook(normalized, secret, {
      timestamp: 1775838000,
      nonce: '9f8e7d6c5b4a3210',
      ehrVendor: 'SIMPLEPRACTICE'
    });

    const verified = verifyIntakeWebhook(signed, secret, { nowSeconds: 1775838120 });
    assert.equal(verified.valid, true);
    assert.equal(verified.payload?.intakeId, 'SP-APT-4410');

    const replayExpired = verifyIntakeWebhook(signed, secret, { nowSeconds: 1775839000 });
    assert.equal(replayExpired.valid, false);
    assert.equal(replayExpired.reason, 'TIMESTAMP_OUTSIDE_REPLAY_WINDOW');

    const tampered = {
      ...signed,
      payload: { ...signed.payload, priorAuthNumber: 'FORGED-999' }
    };
    const badMac = verifyIntakeWebhook(tampered, secret, { nowSeconds: 1775838120 });
    assert.equal(badMac.valid, false);
    assert.equal(badMac.reason, 'HMAC_SIGNATURE_MISMATCH');
  });

  it('14. executes CLI subcommands (validate, x12-270, parse-271, cms1500) in-process and via node subprocess', () => {
    const tmpDir = mkdtempSync(path.join(tmpdir(), 'clinic-preauth-cli-'));
    try {
      const intakePath = path.join(tmpDir, 'intake.json');
      const edi271Path = path.join(tmpDir, 'resp.271');
      writeFileSync(intakePath, JSON.stringify(makeValidIntake(), null, 2), 'utf8');
      writeFileSync(
        edi271Path,
        'ST*271*0001*005010X279A1~NM1*PR*2*BCBS*****PI*84980~NM1*IL*1*VANCE*ELENA****MI*BCBS94827163~EB*1*IND*30~EB*B*IND*AE***27*40*****Y~SE*6*0001~',
        'utf8'
      );

      const captured: string[] = [];
      const io = {
        stdout: (line: string) => captured.push(line),
        stderr: (line: string) => captured.push(line)
      };

      assert.equal(runCli(['validate', '--input', intakePath, '--strict'], io), 0);
      assert.equal(JSON.parse(captured.pop()!).valid, true);

      assert.equal(runCli(['x12-270', '--input', intakePath, '--raw'], io), 0);
      assert.ok(captured.pop()!.startsWith('ISA*00*'));

      assert.equal(runCli(['parse-271', '--input', edi271Path], io), 0);
      assert.equal(JSON.parse(captured.pop()!).copayAmount, 40);

      assert.equal(runCli(['cms1500', '--input', intakePath, '--271', edi271Path, '--strict'], io), 0);
      const cmsOut = JSON.parse(captured.pop()!);
      assert.equal(cmsOut.claimReady, true);
      assert.equal(cmsOut.estimatedPatientResponsibility, 40);

      const cliFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/cli.ts');
      const subOut = execFileSync(process.execPath, ['--no-warnings', cliFile, 'validate', intakePath], {
        encoding: 'utf8'
      });
      assert.equal(JSON.parse(subOut).readyForSubmission, true);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
