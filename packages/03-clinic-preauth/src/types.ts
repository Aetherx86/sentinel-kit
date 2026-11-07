export type PlanType =
  | 'PPO'
  | 'HMO'
  | 'EPO'
  | 'POS'
  | 'MEDICARE'
  | 'MEDICAID'
  | 'TRICARE'
  | 'COMMERCIAL';

export type SpecialtyType =
  | 'PRIMARY_CARE'
  | 'PHYSICAL_THERAPY'
  | 'OCCUPATIONAL_THERAPY'
  | 'SPEECH_THERAPY'
  | 'BEHAVIORAL_HEALTH'
  | 'DENTAL'
  | 'ORTHOPEDICS'
  | 'RADIOLOGY';

export type GenderCode = 'M' | 'F' | 'U';

export type RelationshipCode = '18' | '01' | '19' | 'G8';

export type ValidationSeverity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface PatientDemographics {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: GenderCode;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  accountNumber?: string;
}

export interface SubscriberCoverage {
  memberId: string;
  groupNumber?: string;
  payerId: string;
  payerName: string;
  planType: PlanType;
  relationshipToSubscriber: RelationshipCode;
  subscriberFirstName?: string;
  subscriberLastName?: string;
  subscriberDob?: string;
  subscriberGender?: GenderCode;
  timelyFilingWindowDays?: number;
}

export interface ProviderProfile {
  billingNpi: string;
  renderingNpi: string;
  referringNpi?: string;
  referringName?: string;
  organizationName: string;
  taxId: string;
  taxIdType?: 'EIN' | 'SSN';
  taxonomyCode: string;
  facilityName?: string;
  facilityAddressLine1: string;
  facilityCity: string;
  facilityState: string;
  facilityPostalCode: string;
  specialty: SpecialtyType;
}

export interface RequestedServiceLine {
  lineNumber?: number;
  cptCode: string;
  modifiers: string[];
  diagnosisPointers: number[];
  units: number;
  chargeAmount: number;
  placeOfService?: string;
  serviceDate?: string;
}

export interface ClinicalIntakeRecord {
  intakeId: string;
  receivedAt?: string;
  dateOfService: string;
  placeOfService: string;
  priorAuthNumber?: string;
  patient: PatientDemographics;
  coverage: SubscriberCoverage;
  provider: ProviderProfile;
  diagnosisCodes: string[];
  serviceLines: RequestedServiceLine[];
}

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  field: string;
  message: string;
  remediation: string;
}

export interface LinePriorAuthDecision {
  lineIndex: number;
  cptCode: string;
  category: string;
  requiresPriorAuth: boolean;
  satisfied: boolean;
  reasonCode: string;
}

export interface IntakePreAuthValidationResult {
  valid: boolean;
  readyForSubmission: boolean;
  requiresPriorAuth: boolean;
  riskScore: number;
  npiValid: {
    billing: boolean;
    rendering: boolean;
    referring: boolean;
  };
  memberIdValid: boolean;
  timelyFilingRemainingDays: number;
  lineDecisions: LinePriorAuthDecision[];
  issues: ValidationIssue[];
  ruleSignature: string;
}

export interface X12EnvelopeOptions {
  senderId: string;
  senderQualifier?: string;
  receiverId: string;
  receiverQualifier?: string;
  interchangeControlNumber?: string;
  groupControlNumber?: string;
  transactionControlNumber?: string;
  timestamp?: string;
  usageIndicator?: 'P' | 'T';
  serviceTypeCodes?: string[];
}

export interface X12Build270Result {
  edi: string;
  segmentCount: number;
  transactionSegmentCount: number;
  interchangeControlNumber: string;
  groupControlNumber: string;
  transactionControlNumber: string;
  traceNumber: string;
}

export interface EligibilityBenefitItem {
  infoCode: string;
  coverageLevel?: string;
  serviceTypeCodes: string[];
  insuranceTypeCode?: string;
  planCoverageDescription?: string;
  timePeriodQualifier?: string;
  monetaryAmount?: number;
  percent?: number;
  quantityQualifier?: string;
  quantity?: number;
  authOrCertIndicator?: 'Y' | 'N' | 'U';
  inPlanNetworkIndicator?: 'Y' | 'N' | 'W' | 'U';
}

export interface AaaRejection {
  validRequestIndicator: string;
  rejectReasonCode: string;
  rejectReasonDescription: string;
  followUpActionCode: string;
  followUpDescription: string;
}

export interface NormalizedClearinghouse271Envelope {
  controlNumber?: string;
  traceNumbers?: string[];
  payer?: {
    name?: string;
    id?: string;
  };
  subscriber?: {
    memberId?: string;
    firstName?: string;
    lastName?: string;
  };
  benefitsInformation?: Array<{
    code: string;
    coverageLevelCode?: string;
    serviceTypeCodes?: string[];
    insuranceTypeCode?: string;
    planCoverage?: string;
    timeQualifierCode?: string;
    benefitAmount?: string | number;
    benefitPercent?: string | number;
    authOrCertIndicator?: 'Y' | 'N' | 'U';
    inPlanNetworkIndicatorCode?: 'Y' | 'N' | 'W' | 'U';
  }>;
  aaaErrors?: Array<{
    validRequestIndicator?: string;
    rejectReasonCode: string;
    followUpActionCode?: string;
  }>;
}

export interface ParsedEligibility271 {
  sourceFormat: 'X12_271' | 'NORMALIZED_JSON';
  controlNumber: string;
  traceNumbers: string[];
  payerName: string;
  payerId: string;
  subscriberMemberId: string;
  subscriberName: string;
  activeCoverage: boolean;
  coverageStatus: 'ACTIVE' | 'INACTIVE' | 'REJECTED' | 'UNKNOWN';
  copayAmount: number | null;
  coinsuranceRate: number | null;
  deductibleTotal: number | null;
  deductibleRemaining: number | null;
  outOfPocketRemaining: number | null;
  priorAuthRequired: boolean;
  priorAuthServiceTypes: string[];
  benefits: EligibilityBenefitItem[];
  aaaRejections: AaaRejection[];
}

export interface Cms1500ServiceLine24 {
  lineNumber: number;
  box24aDateFrom: string;
  box24aDateTo: string;
  box24bPlaceOfService: string;
  box24cEmg: string;
  box24dCptHcpcs: string;
  box24dModifiers: string[];
  box24eDiagnosisPointer: string;
  box24fCharges: number;
  box24gDaysOrUnits: number;
  box24iIdQualifier: string;
  box24jRenderingNpi: string;
}

export interface Cms1500PrecheckRecord {
  formVersion: '02/12';
  claimReady: boolean;
  boxes: {
    box1ProgramType:
      | 'MEDICARE'
      | 'MEDICAID'
      | 'TRICARE'
      | 'CHAMPVA'
      | 'GROUP_HEALTH_PLAN'
      | 'FECA_BLK_LUNG'
      | 'OTHER';
    box1aInsuredIdNumber: string;
    box2PatientName: string;
    box3PatientDob: string;
    box3PatientSex: 'M' | 'F';
    box4InsuredName: string;
    box5PatientAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      phone?: string;
    };
    box6PatientRelationshipToInsured: 'SELF' | 'SPOUSE' | 'CHILD' | 'OTHER';
    box11InsuredPolicyGroupNumber: string;
    box11dAnotherHealthBenefitPlan: boolean;
    box17ReferringProviderName: string;
    box17bReferringProviderNpi: string;
    box21DiagnosisNatureIndicator: '0';
    box21Diagnoses: Record<string, string>;
    box23PriorAuthNumber: string;
    box24ServiceLines: Cms1500ServiceLine24[];
    box25FederalTaxId: string;
    box25TaxIdType: 'EIN' | 'SSN';
    box26PatientAccountNumber: string;
    box27AcceptAssignment: boolean;
    box28TotalCharge: number;
    box29AmountPaid: number;
    box31SignatureOfPhysician: string;
    box32ServiceFacilityLocation: {
      name: string;
      address: string;
      cityStateZip: string;
      npi: string;
    };
    box33BillingProvider: {
      name: string;
      address: string;
      cityStateZip: string;
      npi: string;
      taxonomyQualifier: string;
      taxonomyCode: string;
    };
  };
  estimatedPatientResponsibility: number | null;
  clearinghouseBlockers: ValidationIssue[];
}

export type EhrVendor =
  | 'SIMPLEPRACTICE'
  | 'JANEAPP'
  | 'WEBPT'
  | 'OPENDENTAL'
  | 'GENERIC';

export interface RawExtensionDomCapture {
  ehrVendor?: EhrVendor;
  pageUrl?: string;
  capturedAt: string;
  fields: Record<string, string>;
}

export interface SignedIntakeWebhookEnvelope {
  version: '1.0';
  timestamp: number;
  nonce: string;
  ehrVendor: EhrVendor;
  payload: ClinicalIntakeRecord;
  signature: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: string;
  payload?: ClinicalIntakeRecord;
}
