import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type {
  ClinicalIntakeRecord,
  EhrVendor,
  GenderCode,
  PlanType,
  RawExtensionDomCapture,
  RelationshipCode,
  RequestedServiceLine,
  SignedIntakeWebhookEnvelope,
  SpecialtyType,
  WebhookVerificationResult
} from '../types.ts';

const UI_NOISE_PATTERNS = [
  /^_/,
  /csrf/i,
  /token/i,
  /react/i,
  /intercom/i,
  /analytics/i,
  /viewport/i,
  /scroll/i,
  /^ui_/i,
  /theme/i,
  /session/i,
  /cookie/i,
  /search_filter/i,
  /modal_/i
];

function isUiNoiseKey(key: string): boolean {
  return UI_NOISE_PATTERNS.some((re) => re.test(key));
}

function detectVendor(capture: RawExtensionDomCapture): EhrVendor {
  if (capture.ehrVendor) return capture.ehrVendor;
  const url = (capture.pageUrl ?? '').toLowerCase();
  if (url.includes('simplepractice')) return 'SIMPLEPRACTICE';
  if (url.includes('jane.app') || url.includes('janeapp')) return 'JANEAPP';
  if (url.includes('webpt')) return 'WEBPT';
  if (url.includes('opendental')) return 'OPENDENTAL';
  return 'GENERIC';
}

function normalizeDate(raw: string | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (us) {
    return `${us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
  }
  return trimmed;
}

function pickField(cleanMap: Map<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    const val = cleanMap.get(alias.toLowerCase());
    if (val !== undefined && val !== '') return val;
  }
  return '';
}

function parseGender(raw: string): GenderCode {
  const v = raw.trim().toUpperCase();
  if (v === 'F' || v === 'FEMALE') return 'F';
  if (v === 'M' || v === 'MALE') return 'M';
  return 'U';
}

function parseRelationship(raw: string): RelationshipCode {
  const v = raw.trim().toUpperCase();
  if (v === '01' || v === 'SPOUSE') return '01';
  if (v === '19' || v === 'CHILD') return '19';
  if (v === 'G8' || v === 'OTHER') return 'G8';
  return '18';
}

function parsePlanType(raw: string): PlanType {
  const v = raw.trim().toUpperCase();
  const allowed: PlanType[] = [
    'PPO',
    'HMO',
    'EPO',
    'POS',
    'MEDICARE',
    'MEDICAID',
    'TRICARE',
    'COMMERCIAL'
  ];
  return (allowed.find((p) => p === v) ?? 'COMMERCIAL');
}

function parseSpecialty(raw: string, vendor: EhrVendor): SpecialtyType {
  const v = raw.trim().toUpperCase();
  const allowed: SpecialtyType[] = [
    'PRIMARY_CARE',
    'PHYSICAL_THERAPY',
    'OCCUPATIONAL_THERAPY',
    'SPEECH_THERAPY',
    'BEHAVIORAL_HEALTH',
    'DENTAL',
    'ORTHOPEDICS',
    'RADIOLOGY'
  ];
  const matched = allowed.find((s) => s === v);
  if (matched) return matched;
  if (vendor === 'SIMPLEPRACTICE') return 'BEHAVIORAL_HEALTH';
  if (vendor === 'WEBPT' || vendor === 'JANEAPP') return 'PHYSICAL_THERAPY';
  if (vendor === 'OPENDENTAL') return 'DENTAL';
  return 'PRIMARY_CARE';
}

function parseServiceLines(cleanMap: Map<string, string>): RequestedServiceLine[] {
  const lines: RequestedServiceLine[] = [];

  // Compact multi-line format: "97110|GP|2|140.00|1,2;97140|GP,59|1|75.00|1"
  const compact = pickField(cleanMap, [
    'service_lines',
    'billing_codes',
    'pt_service_lines',
    'ada_proc_codes'
  ]);
  if (compact) {
    const entries = compact.split(';').map((s) => s.trim()).filter(Boolean);
    entries.forEach((entry, idx) => {
      const parts = entry.split('|').map((p) => p.trim());
      const cptCode = (parts[0] ?? '').toUpperCase();
      const modifiers = parts[1] ? parts[1].split(',').map((m) => m.trim().toUpperCase()).filter(Boolean) : [];
      const units = parts[2] ? Number(parts[2]) : 1;
      const chargeAmount = parts[3] ? Number(parts[3]) : 150;
      const diagnosisPointers = parts[4]
        ? parts[4].split(',').map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n))
        : [1];
      lines.push({
        lineNumber: idx + 1,
        cptCode,
        modifiers,
        units,
        chargeAmount,
        diagnosisPointers
      });
    });
    return lines;
  }

  for (let i = 1; i <= 6; i++) {
    const cpt = pickField(cleanMap, [`cpt_code_${i}`, `cpt_${i}`, `proc_code_${i}`, i === 1 ? 'cpt_code' : '']);
    if (!cpt) continue;
    const modRaw = pickField(cleanMap, [`modifiers_${i}`, `modifier_${i}`, i === 1 ? 'modifiers' : '']);
    const unitsRaw = pickField(cleanMap, [`units_${i}`, i === 1 ? 'units' : '']);
    const chargeRaw = pickField(cleanMap, [`charge_${i}`, `fee_${i}`, i === 1 ? 'charge_amount' : '']);
    const ptrRaw = pickField(cleanMap, [`dx_pointers_${i}`, `pointers_${i}`, i === 1 ? 'dx_pointers' : '']);

    lines.push({
      lineNumber: lines.length + 1,
      cptCode: cpt.toUpperCase(),
      modifiers: modRaw ? modRaw.split(/[,\s]+/).map((m) => m.trim().toUpperCase()).filter(Boolean) : [],
      units: unitsRaw ? Number(unitsRaw) : 1,
      chargeAmount: chargeRaw ? Number(chargeRaw) : 150,
      diagnosisPointers: ptrRaw
        ? ptrRaw.split(/[,\s]+/).map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n))
        : [1]
    });
  }

  return lines;
}

export function stripCaptureNoise(fields: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [rawKey, rawVal] of Object.entries(fields)) {
    const key = rawKey.trim();
    if (!key || isUiNoiseKey(key)) continue;
    if (typeof rawVal !== 'string') continue;
    const val = rawVal.replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
    if (val === '') continue;
    sanitized[key] = val;
  }
  return sanitized;
}

export function normalizeExtensionCapture(capture: RawExtensionDomCapture): ClinicalIntakeRecord {
  const vendor = detectVendor(capture);
  const filtered = stripCaptureNoise(capture.fields);
  const cleanMap = new Map<string, string>();
  for (const [k, v] of Object.entries(filtered)) {
    cleanMap.set(k.toLowerCase(), v);
  }

  const dxRaw = pickField(cleanMap, [
    'icd10_diagnoses',
    'diagnosis_codes',
    'dx_codes',
    'primary_diagnosis'
  ]);
  const diagnosisCodes = dxRaw
    ? dxRaw.split(/[,;\s]+/).map((d) => d.trim().toUpperCase()).filter(Boolean)
    : [];

  const billingNpi = pickField(cleanMap, ['billing_npi', 'clinic_npi', 'group_npi', 'npi']).replace(/\D/g, '');
  const renderingNpi =
    pickField(cleanMap, ['rendering_npi', 'therapist_npi', 'clinician_npi', 'provider_npi']).replace(/\D/g, '') ||
    billingNpi;

  return {
    intakeId:
      pickField(cleanMap, ['intake_id', 'appointment_id', 'encounter_id', 'claim_ref']) ||
      `EXT-${vendor}-0001`,
    receivedAt: capture.capturedAt.slice(0, 10),
    dateOfService:
      normalizeDate(pickField(cleanMap, ['date_of_service', 'dos', 'session_date', 'visit_date'])) ||
      capture.capturedAt.slice(0, 10),
    placeOfService: pickField(cleanMap, ['place_of_service', 'pos_code', 'pos']) || '11',
    priorAuthNumber: pickField(cleanMap, ['prior_auth_number', 'auth_number', 'preauth_id']) || undefined,
    patient: {
      firstName: pickField(cleanMap, ['patient_first_name', 'client_first_name', 'patient.given_name', 'pat_fname']),
      lastName: pickField(cleanMap, ['patient_last_name', 'client_last_name', 'patient.family_name', 'pat_lname']),
      middleName: pickField(cleanMap, ['patient_middle_name', 'pat_mname']) || undefined,
      dob: normalizeDate(pickField(cleanMap, ['patient_dob', 'client_dob', 'patient.birth_date', 'pat_birthdate'])),
      gender: parseGender(pickField(cleanMap, ['patient_gender', 'client_sex', 'patient.sex', 'pat_sex'])),
      addressLine1: pickField(cleanMap, ['patient_address', 'client_street', 'pat_address']) || '100 MAIN ST',
      city: pickField(cleanMap, ['patient_city', 'client_city', 'pat_city']) || 'AUSTIN',
      state: (pickField(cleanMap, ['patient_state', 'client_state', 'pat_state']) || 'TX').toUpperCase(),
      postalCode: pickField(cleanMap, ['patient_zip', 'client_zip', 'pat_zip']) || '78701',
      phone: pickField(cleanMap, ['patient_phone', 'client_phone', 'pat_phone']) || undefined,
      accountNumber: pickField(cleanMap, ['patient_account', 'chart_number', 'pat_num']) || undefined
    },
    coverage: {
      memberId: pickField(cleanMap, [
        'member_id',
        'insurance_member_id',
        'policy_member_number',
        'subsc_id'
      ]).toUpperCase(),
      groupNumber: pickField(cleanMap, ['group_number', 'insurance_group', 'policy_group']) || undefined,
      payerId: pickField(cleanMap, ['payer_id', 'clearinghouse_payer_id', 'electronic_payer_id']) || '00000',
      payerName: pickField(cleanMap, ['payer_name', 'insurance_payer', 'carrier_name']) || 'COMMERCIAL PAYER',
      planType: parsePlanType(pickField(cleanMap, ['plan_type', 'insurance_plan_type'])),
      relationshipToSubscriber: parseRelationship(
        pickField(cleanMap, ['relationship_to_subscriber', 'insured_relationship', 'rel_to_insured'])
      ),
      subscriberFirstName: pickField(cleanMap, ['subscriber_first_name', 'insured_first_name']) || undefined,
      subscriberLastName: pickField(cleanMap, ['subscriber_last_name', 'insured_last_name']) || undefined,
      subscriberDob:
        normalizeDate(pickField(cleanMap, ['subscriber_dob', 'insured_dob'])) || undefined
    },
    provider: {
      billingNpi,
      renderingNpi,
      referringNpi: pickField(cleanMap, ['referring_npi', 'ref_provider_npi']).replace(/\D/g, '') || undefined,
      referringName: pickField(cleanMap, ['referring_name', 'ref_provider_name']) || undefined,
      organizationName: pickField(cleanMap, ['organization_name', 'clinic_name', 'practice_name']) || 'CLINIC PRACTICE',
      taxId: pickField(cleanMap, ['tax_id', 'clinic_ein', 'tin']) || '000000000',
      taxIdType: 'EIN',
      taxonomyCode: pickField(cleanMap, ['taxonomy_code', 'provider_taxonomy']) || '207Q00000X',
      facilityAddressLine1: pickField(cleanMap, ['facility_address', 'clinic_address']) || '200 MEDICAL PKWY',
      facilityCity: pickField(cleanMap, ['facility_city', 'clinic_city']) || 'AUSTIN',
      facilityState: (pickField(cleanMap, ['facility_state', 'clinic_state']) || 'TX').toUpperCase(),
      facilityPostalCode: pickField(cleanMap, ['facility_zip', 'clinic_zip']) || '78701',
      specialty: parseSpecialty(pickField(cleanMap, ['specialty', 'clinic_specialty']), vendor)
    },
    diagnosisCodes,
    serviceLines: parseServiceLines(cleanMap)
  };
}

function canonicalizeValue(val: unknown): string {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return `[${val.map((item) => canonicalizeValue(item)).join(',')}]`;
  }
  const obj = val as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeValue(obj[k])}`).join(',')}}`;
}

function computeWebhookMac(
  secret: string,
  timestamp: number,
  nonce: string,
  payload: ClinicalIntakeRecord
): Buffer {
  const signingInput = `${timestamp}.${nonce}.${canonicalizeValue(payload)}`;
  return createHmac('sha256', secret).update(signingInput, 'utf8').digest();
}

export function signIntakeWebhook(
  payload: ClinicalIntakeRecord,
  secret: string,
  options?: { timestamp?: number; nonce?: string; ehrVendor?: EhrVendor }
): SignedIntakeWebhookEnvelope {
  if (!secret || secret.length < 16) {
    throw new Error('Webhook signing secret must be at least 16 characters');
  }
  const timestamp = options?.timestamp ?? Math.floor(Date.now() / 1000);
  const nonce = options?.nonce ?? randomBytes(12).toString('hex');
  const ehrVendor = options?.ehrVendor ?? 'GENERIC';
  const signature = computeWebhookMac(secret, timestamp, nonce, payload).toString('hex');

  return {
    version: '1.0',
    timestamp,
    nonce,
    ehrVendor,
    payload,
    signature
  };
}

export function verifyIntakeWebhook(
  envelope: SignedIntakeWebhookEnvelope,
  secret: string,
  options?: { nowSeconds?: number; toleranceSeconds?: number }
): WebhookVerificationResult {
  if (!secret || secret.length < 16) {
    return { valid: false, reason: 'INVALID_SIGNING_SECRET' };
  }
  if (!envelope || envelope.version !== '1.0' || !envelope.nonce || envelope.nonce.length < 8) {
    return { valid: false, reason: 'MALFORMED_ENVELOPE' };
  }

  const nowSeconds = options?.nowSeconds ?? Math.floor(Date.now() / 1000);
  const toleranceSeconds = options?.toleranceSeconds ?? 300;
  if (Math.abs(nowSeconds - envelope.timestamp) > toleranceSeconds) {
    return { valid: false, reason: 'TIMESTAMP_OUTSIDE_REPLAY_WINDOW' };
  }

  if (!/^[0-9a-f]{64}$/i.test(envelope.signature)) {
    return { valid: false, reason: 'MALFORMED_SIGNATURE_HEX' };
  }

  const expectedMac = computeWebhookMac(secret, envelope.timestamp, envelope.nonce, envelope.payload);
  const providedMac = Buffer.from(envelope.signature, 'hex');
  if (expectedMac.length !== providedMac.length || !timingSafeEqual(expectedMac, providedMac)) {
    return { valid: false, reason: 'HMAC_SIGNATURE_MISMATCH' };
  }

  return { valid: true, payload: envelope.payload };
}
