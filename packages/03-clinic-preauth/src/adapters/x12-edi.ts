import type {
  AaaRejection,
  ClinicalIntakeRecord,
  EligibilityBenefitItem,
  NormalizedClearinghouse271Envelope,
  ParsedEligibility271,
  SpecialtyType,
  X12Build270Result,
  X12EnvelopeOptions
} from '../types.ts';

const AAA_REJECT_REASONS: Record<string, string> = {
  '15': 'Required application data missing',
  '33': 'Input errors in inquiry elements',
  '41': 'Authorization/access restrictions',
  '42': 'Unable to respond at current time',
  '43': 'Invalid/missing provider identification',
  '51': 'Provider not on file',
  '71': 'Patient birth date does not match payer database',
  '72': 'Invalid/missing subscriber/insured ID',
  '73': 'Invalid/missing subscriber/insured name',
  '75': 'Subscriber/insured not found',
  '76': 'Duplicate subscriber/insured ID number',
  '79': 'Invalid participant identification'
};

const AAA_FOLLOWUP_ACTIONS: Record<string, string> = {
  C: 'Correct and resubmit',
  N: 'Resubmission not allowed',
  P: 'Resubmit original transaction',
  R: 'Resubmission allowed',
  S: 'Do not resubmit; inquiry forwarded to third party',
  Y: 'Do not resubmit; payer holding request'
};

function sanitizeElement(value: string): string {
  return value.replace(/[*~^:\r\n]/g, ' ').trim().toUpperCase();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function padRight(value: string, width: number, fill = ' '): string {
  const clean = sanitizeElement(value);
  return clean.length >= width ? clean.slice(0, width) : clean.padEnd(width, fill);
}

function padLeftDigits(value: string, width: number): string {
  const d = digitsOnly(value);
  return d.length >= width ? d.slice(-width) : d.padStart(width, '0');
}

function toCcyymmdd(isoDate: string): string {
  const d = digitsOnly(isoDate);
  return d.slice(0, 8);
}

function defaultServiceTypesForSpecialty(specialty: SpecialtyType): string[] {
  switch (specialty) {
    case 'PHYSICAL_THERAPY':
    case 'OCCUPATIONAL_THERAPY':
      return ['30', 'AE'];
    case 'SPEECH_THERAPY':
      return ['30', 'AF'];
    case 'BEHAVIORAL_HEALTH':
      return ['30', 'MH'];
    case 'DENTAL':
      return ['35'];
    case 'RADIOLOGY':
      return ['30', '73'];
    default:
      return ['30', '98'];
  }
}

function formatEnvelopeTimestamp(ts?: string): { yymmdd: string; ccyymmdd: string; hhmm: string } {
  const dt = ts ? new Date(ts) : new Date('2026-01-15T12:00:00Z');
  const valid = Number.isNaN(dt.getTime()) ? new Date('2026-01-15T12:00:00Z') : dt;
  const yyyy = String(valid.getUTCFullYear()).padStart(4, '0');
  const mm = String(valid.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(valid.getUTCDate()).padStart(2, '0');
  const hh = String(valid.getUTCHours()).padStart(2, '0');
  const mi = String(valid.getUTCMinutes()).padStart(2, '0');
  return {
    yymmdd: `${yyyy.slice(2)}${mm}${dd}`,
    ccyymmdd: `${yyyy}${mm}${dd}`,
    hhmm: `${hh}${mi}`
  };
}

export function buildX12Eligibility270(
  intake: ClinicalIntakeRecord,
  options: X12EnvelopeOptions
): X12Build270Result {
  const senderQual = padRight(options.senderQualifier ?? 'ZZ', 2);
  const receiverQual = padRight(options.receiverQualifier ?? 'ZZ', 2);
  const icn = padLeftDigits(options.interchangeControlNumber ?? '1', 9);
  const gcn = digitsOnly(options.groupControlNumber ?? '1') || '1';
  const tcnRaw = digitsOnly(options.transactionControlNumber ?? '1') || '1';
  const tcn = tcnRaw.length < 4 ? tcnRaw.padStart(4, '0') : tcnRaw.slice(0, 9);
  const usage = options.usageIndicator ?? 'P';
  const { yymmdd, ccyymmdd, hhmm } = formatEnvelopeTimestamp(options.timestamp ?? intake.receivedAt);
  const traceNumber = sanitizeElement(intake.intakeId || `TRN${tcn}`).slice(0, 30);
  const eqCodes =
    options.serviceTypeCodes && options.serviceTypeCodes.length > 0
      ? options.serviceTypeCodes
      : defaultServiceTypesForSpecialty(intake.provider.specialty);

  // ANSI X12 ISA header is fixed-width (105 chars + segment terminator = 106 bytes).
  const isa = [
    'ISA',
    '00',
    '          ',
    '00',
    '          ',
    senderQual,
    padRight(options.senderId, 15),
    receiverQual,
    padRight(options.receiverId, 15),
    yymmdd,
    hhmm,
    '^',
    '00501',
    icn,
    '0',
    usage,
    ':'
  ].join('*');

  const gs = [
    'GS',
    'HS',
    sanitizeElement(options.senderId),
    sanitizeElement(options.receiverId),
    ccyymmdd,
    hhmm,
    gcn,
    'X',
    '005010X279A1'
  ].join('*');

  const txSegments: string[] = [];
  txSegments.push(`ST*270*${tcn}*005010X279A1`);
  txSegments.push(`BHT*0022*13*${traceNumber}*${ccyymmdd}*${hhmm}`);

  // Loop 2000A / 2100A: Information Source (Payer)
  txSegments.push('HL*1**20*1');
  txSegments.push(
    `NM1*PR*2*${sanitizeElement(intake.coverage.payerName)}*****PI*${sanitizeElement(intake.coverage.payerId)}`
  );

  // Loop 2000B / 2100B: Information Receiver (Clinic / Billing Provider)
  txSegments.push('HL*2*1*21*1');
  txSegments.push(
    `NM1*1P*2*${sanitizeElement(intake.provider.organizationName)}*****XX*${digitsOnly(intake.provider.billingNpi)}`
  );
  if (intake.provider.taxonomyCode) {
    txSegments.push(`PRV*BI*PXC*${sanitizeElement(intake.provider.taxonomyCode)}`);
  }

  const taxDigits = padLeftDigits(intake.provider.taxId, 9);
  const isSelf = intake.coverage.relationshipToSubscriber === '18';

  if (isSelf) {
    txSegments.push('HL*3*2*22*0');
    txSegments.push(`TRN*1*${traceNumber}*9${taxDigits}`);
    txSegments.push(
      [
        'NM1',
        'IL',
        '1',
        sanitizeElement(intake.patient.lastName),
        sanitizeElement(intake.patient.firstName),
        sanitizeElement(intake.patient.middleName ?? ''),
        '',
        '',
        'MI',
        sanitizeElement(intake.coverage.memberId)
      ].join('*')
    );
    if (intake.coverage.groupNumber) {
      txSegments.push(`REF*6P*${sanitizeElement(intake.coverage.groupNumber)}`);
    }
    txSegments.push(`DMG*D8*${toCcyymmdd(intake.patient.dob)}*${intake.patient.gender}`);
    txSegments.push(`DTP*291*D8*${toCcyymmdd(intake.dateOfService)}`);
    for (const eq of eqCodes) {
      txSegments.push(`EQ*${sanitizeElement(eq)}`);
    }
  } else {
    txSegments.push('HL*3*2*22*1');
    txSegments.push(
      [
        'NM1',
        'IL',
        '1',
        sanitizeElement(intake.coverage.subscriberLastName ?? intake.patient.lastName),
        sanitizeElement(intake.coverage.subscriberFirstName ?? ''),
        '',
        '',
        '',
        'MI',
        sanitizeElement(intake.coverage.memberId)
      ].join('*')
    );
    if (intake.coverage.groupNumber) {
      txSegments.push(`REF*6P*${sanitizeElement(intake.coverage.groupNumber)}`);
    }
    if (intake.coverage.subscriberDob) {
      txSegments.push(
        `DMG*D8*${toCcyymmdd(intake.coverage.subscriberDob)}*${intake.coverage.subscriberGender ?? 'U'}`
      );
    }

    // Loop 2000D / 2100D: Dependent
    txSegments.push('HL*4*3*23*0');
    txSegments.push(`TRN*1*${traceNumber}*9${taxDigits}`);
    txSegments.push(
      [
        'NM1',
        '03',
        '1',
        sanitizeElement(intake.patient.lastName),
        sanitizeElement(intake.patient.firstName),
        sanitizeElement(intake.patient.middleName ?? '')
      ].join('*')
    );
    txSegments.push(`DMG*D8*${toCcyymmdd(intake.patient.dob)}*${intake.patient.gender}`);
    txSegments.push(`INS*N*${intake.coverage.relationshipToSubscriber}`);
    txSegments.push(`DTP*291*D8*${toCcyymmdd(intake.dateOfService)}`);
    for (const eq of eqCodes) {
      txSegments.push(`EQ*${sanitizeElement(eq)}`);
    }
  }

  const transactionSegmentCount = txSegments.length + 1;
  txSegments.push(`SE*${transactionSegmentCount}*${tcn}`);

  const ge = `GE*1*${gcn}`;
  const iea = `IEA*1*${icn}`;

  const allSegments = [isa, gs, ...txSegments, ge, iea];
  return {
    edi: `${allSegments.join('~')}~`,
    segmentCount: allSegments.length,
    transactionSegmentCount,
    interchangeControlNumber: icn,
    groupControlNumber: gcn,
    transactionControlNumber: tcn,
    traceNumber
  };
}

function summarizeBenefits(
  benefits: EligibilityBenefitItem[],
  aaaRejections: AaaRejection[]
): Pick<
  ParsedEligibility271,
  | 'activeCoverage'
  | 'coverageStatus'
  | 'copayAmount'
  | 'coinsuranceRate'
  | 'deductibleTotal'
  | 'deductibleRemaining'
  | 'outOfPocketRemaining'
  | 'priorAuthRequired'
  | 'priorAuthServiceTypes'
> {
  let hasActive = false;
  let hasInactive = false;
  let copayAmount: number | null = null;
  let coinsuranceRate: number | null = null;
  let deductibleTotal: number | null = null;
  let deductibleRemaining: number | null = null;
  let outOfPocketRemaining: number | null = null;
  let priorAuthRequired = false;
  const paTypes = new Set<string>();

  for (const b of benefits) {
    const inNetworkPreferred = b.inPlanNetworkIndicator !== 'N';
    if (b.infoCode >= '1' && b.infoCode <= '5') {
      hasActive = true;
    } else if (b.infoCode >= '6' && b.infoCode <= '8') {
      hasInactive = true;
    }

    if (b.authOrCertIndicator === 'Y') {
      priorAuthRequired = true;
      for (const st of b.serviceTypeCodes) {
        if (st) paTypes.add(st);
      }
    }

    if (b.infoCode === 'B' && typeof b.monetaryAmount === 'number') {
      if (copayAmount === null || inNetworkPreferred) {
        copayAmount = b.monetaryAmount;
      }
    } else if (b.infoCode === 'A' && typeof b.percent === 'number') {
      if (coinsuranceRate === null || inNetworkPreferred) {
        coinsuranceRate = b.percent > 1 ? b.percent / 100 : b.percent;
      }
    } else if (b.infoCode === 'C' && typeof b.monetaryAmount === 'number') {
      if (b.timePeriodQualifier === '29') {
        if (deductibleRemaining === null || inNetworkPreferred) {
          deductibleRemaining = b.monetaryAmount;
        }
      } else if (deductibleTotal === null || inNetworkPreferred) {
        deductibleTotal = b.monetaryAmount;
      }
    } else if (b.infoCode === 'G' && typeof b.monetaryAmount === 'number') {
      if (b.timePeriodQualifier === '29' && (outOfPocketRemaining === null || inNetworkPreferred)) {
        outOfPocketRemaining = b.monetaryAmount;
      }
    }
  }

  let coverageStatus: ParsedEligibility271['coverageStatus'] = 'UNKNOWN';
  if (hasActive && !hasInactive) {
    coverageStatus = 'ACTIVE';
  } else if (hasInactive && !hasActive) {
    coverageStatus = 'INACTIVE';
  } else if (hasActive && hasInactive) {
    const primaryActive = benefits.some(
      (b) => b.infoCode >= '1' && b.infoCode <= '5' && b.serviceTypeCodes.includes('30')
    );
    coverageStatus = primaryActive ? 'ACTIVE' : 'INACTIVE';
  } else if (aaaRejections.length > 0) {
    coverageStatus = 'REJECTED';
  }

  return {
    activeCoverage: coverageStatus === 'ACTIVE',
    coverageStatus,
    copayAmount,
    coinsuranceRate,
    deductibleTotal,
    deductibleRemaining,
    outOfPocketRemaining,
    priorAuthRequired,
    priorAuthServiceTypes: Array.from(paTypes)
  };
}

function parseNormalizedJson271(env: NormalizedClearinghouse271Envelope): ParsedEligibility271 {
  const benefits: EligibilityBenefitItem[] = (env.benefitsInformation ?? []).map((item) => {
    const amt =
      item.benefitAmount !== undefined && item.benefitAmount !== ''
        ? Number(item.benefitAmount)
        : undefined;
    const pct =
      item.benefitPercent !== undefined && item.benefitPercent !== ''
        ? Number(item.benefitPercent)
        : undefined;
    return {
      infoCode: item.code,
      coverageLevel: item.coverageLevelCode,
      serviceTypeCodes: item.serviceTypeCodes ?? [],
      insuranceTypeCode: item.insuranceTypeCode,
      planCoverageDescription: item.planCoverage,
      timePeriodQualifier: item.timeQualifierCode,
      monetaryAmount: amt !== undefined && !Number.isNaN(amt) ? amt : undefined,
      percent: pct !== undefined && !Number.isNaN(pct) ? pct : undefined,
      authOrCertIndicator: item.authOrCertIndicator,
      inPlanNetworkIndicator: item.inPlanNetworkIndicatorCode
    };
  });

  const aaaRejections: AaaRejection[] = (env.aaaErrors ?? []).map((err) => {
    const code = err.rejectReasonCode;
    const follow = err.followUpActionCode ?? 'C';
    return {
      validRequestIndicator: err.validRequestIndicator ?? 'N',
      rejectReasonCode: code,
      rejectReasonDescription: AAA_REJECT_REASONS[code] ?? `Clearinghouse reject code ${code}`,
      followUpActionCode: follow,
      followUpDescription: AAA_FOLLOWUP_ACTIONS[follow] ?? `Follow-up action ${follow}`
    };
  });

  const subFirst = env.subscriber?.firstName ?? '';
  const subLast = env.subscriber?.lastName ?? '';
  const subscriberName = [subLast, subFirst].filter(Boolean).join(', ');
  const summary = summarizeBenefits(benefits, aaaRejections);

  return {
    sourceFormat: 'NORMALIZED_JSON',
    controlNumber: env.controlNumber ?? '',
    traceNumbers: env.traceNumbers ?? [],
    payerName: env.payer?.name ?? '',
    payerId: env.payer?.id ?? '',
    subscriberMemberId: env.subscriber?.memberId ?? '',
    subscriberName,
    benefits,
    aaaRejections,
    ...summary
  };
}

export function parseX12Eligibility271(
  payload: string | NormalizedClearinghouse271Envelope
): ParsedEligibility271 {
  if (typeof payload === 'object' && payload !== null) {
    return parseNormalizedJson271(payload);
  }

  const trimmed = payload.trim();
  if (trimmed.startsWith('{')) {
    const parsedObj = JSON.parse(trimmed) as NormalizedClearinghouse271Envelope;
    return parseNormalizedJson271(parsedObj);
  }

  let elemSep = '*';
  let repSep = '^';
  let segTerm = '~';

  if (trimmed.startsWith('ISA') && trimmed.length >= 106) {
    elemSep = trimmed[3];
    repSep = trimmed[82] === elemSep ? '^' : trimmed[82];
    segTerm = trimmed[105];
  }

  const rawSegments = trimmed
    .split(segTerm)
    .map((s) => s.replace(/^[\r\n]+|[\r\n]+$/g, '').trim())
    .filter(Boolean);

  let controlNumber = '';
  const traceNumbers: string[] = [];
  let payerName = '';
  let payerId = '';
  let subscriberMemberId = '';
  let subscriberName = '';
  const benefits: EligibilityBenefitItem[] = [];
  const aaaRejections: AaaRejection[] = [];

  for (const seg of rawSegments) {
    const els = seg.split(elemSep);
    const tag = els[0];

    if (tag === 'ST' && els[1] === '271') {
      controlNumber = els[2] ?? '';
    } else if (tag === 'TRN' && els[2]) {
      traceNumbers.push(els[2]);
    } else if (tag === 'NM1') {
      const entityId = els[1];
      if (entityId === 'PR') {
        payerName = els[3] ?? '';
        if (els[8] === 'PI' || els[8] === 'XV') {
          payerId = els[9] ?? '';
        }
      } else if (entityId === 'IL') {
        const last = els[3] ?? '';
        const first = els[4] ?? '';
        subscriberName = [last, first].filter(Boolean).join(', ');
        if (els[8] === 'MI' || els[8] === 'ZZ') {
          subscriberMemberId = els[9] ?? '';
        }
      }
    } else if (tag === 'AAA') {
      const validInd = els[1] ?? 'N';
      const rejectCode = els[3] ?? '';
      const followCode = els[4] ?? '';
      aaaRejections.push({
        validRequestIndicator: validInd,
        rejectReasonCode: rejectCode,
        rejectReasonDescription:
          AAA_REJECT_REASONS[rejectCode] ?? `Clearinghouse reject code ${rejectCode}`,
        followUpActionCode: followCode,
        followUpDescription:
          AAA_FOLLOWUP_ACTIONS[followCode] ?? `Follow-up action ${followCode}`
      });
    } else if (tag === 'EB') {
      const infoCode = els[1] ?? '';
      const coverageLevel = els[2] || undefined;
      const serviceTypeCodes = els[3] ? els[3].split(repSep).filter(Boolean) : [];
      const insuranceTypeCode = els[4] || undefined;
      const planCoverageDescription = els[5] || undefined;
      const timePeriodQualifier = els[6] || undefined;
      const monetaryAmount =
        els[7] !== undefined && els[7] !== '' && !Number.isNaN(Number(els[7]))
          ? Number(els[7])
          : undefined;
      const percent =
        els[8] !== undefined && els[8] !== '' && !Number.isNaN(Number(els[8]))
          ? Number(els[8])
          : undefined;
      const quantityQualifier = els[9] || undefined;
      const quantity =
        els[10] !== undefined && els[10] !== '' && !Number.isNaN(Number(els[10]))
          ? Number(els[10])
          : undefined;
      const authRaw = els[11];
      const authOrCertIndicator =
        authRaw === 'Y' || authRaw === 'N' || authRaw === 'U' ? authRaw : undefined;
      const netRaw = els[12];
      const inPlanNetworkIndicator =
        netRaw === 'Y' || netRaw === 'N' || netRaw === 'W' || netRaw === 'U' ? netRaw : undefined;

      benefits.push({
        infoCode,
        coverageLevel,
        serviceTypeCodes,
        insuranceTypeCode,
        planCoverageDescription,
        timePeriodQualifier,
        monetaryAmount,
        percent,
        quantityQualifier,
        quantity,
        authOrCertIndicator,
        inPlanNetworkIndicator
      });
    }
  }

  const summary = summarizeBenefits(benefits, aaaRejections);

  return {
    sourceFormat: 'X12_271',
    controlNumber,
    traceNumbers,
    payerName,
    payerId,
    subscriberMemberId,
    subscriberName,
    benefits,
    aaaRejections,
    ...summary
  };
}
