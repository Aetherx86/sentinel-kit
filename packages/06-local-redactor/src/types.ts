export type PiiCategory =
  | 'SSN'
  | 'EIN'
  | 'PAN'
  | 'ABA_ROUTING'
  | 'IBAN'
  | 'EMAIL'
  | 'PHONE'
  | 'CLIENT_LABEL'
  | 'ACCOUNT_ID'
  | 'CUSTOM';

export type RedactionMaskStyle = 'token' | 'preserve-length';

export interface CustomRedactionRule {
  id: string;
  label?: string;
  pattern: string | RegExp;
  literal?: boolean;
  caseInsensitive?: boolean;
}

export interface RedactionOptions {
  categories?: PiiCategory[];
  maskStyle?: RedactionMaskStyle;
  maskChar?: string;
  customRules?: CustomRedactionRule[];
}

export interface DetectedPiiSpan {
  start: number;
  end: number;
  category: PiiCategory;
  ruleId: string;
  replacement: string;
}

export type CategoryCountMap = Partial<Record<PiiCategory, number>>;

export interface TextRedactionResult {
  redactedText: string;
  totalRedactions: number;
  categoryCounts: CategoryCountMap;
  spans: Array<{
    start: number;
    end: number;
    category: PiiCategory;
    ruleId: string;
  }>;
}

export interface PdfRedactionResult {
  pdfBuffer: Buffer;
  totalRedactions: number;
  categoryCounts: CategoryCountMap;
  streamsInspected: number;
  streamsModified: number;
}

export type PdfLineSpec = string | Array<string | number>;

export interface SamplePdfOptions {
  lines: PdfLineSpec[];
  compress?: boolean;
}

export interface WasmChecksumSpan {
  start: number;
  end: number;
  category: 'SSN' | 'PAN' | 'ABA_ROUTING' | 'IBAN';
}

export interface WasmScannerBridge {
  readonly backend: 'wasm' | 'js-fallback';
  validateSsn(input: string): boolean;
  validateLuhnPan(input: string): boolean;
  validateAbaRouting(input: string): boolean;
  validateIbanMod97(input: string): boolean;
  maskBufferSpan(input: Uint8Array, maskChar?: string, preserveDelimiters?: boolean): {
    output: Uint8Array;
    scrubbedBytes: number;
  };
  scanChecksumSpans(input: string | Uint8Array): WasmChecksumSpan[];
}

export interface ComplianceDocumentRecord {
  documentName: string;
  format: 'pdf' | 'txt' | 'csv' | 'json' | 'md';
  inputBytes: number;
  outputBytes: number;
  inputSha256: string;
  outputSha256: string;
  totalRedactions: number;
  categoryCounts: CategoryCountMap;
}

export interface ComplianceManifest {
  schemaVersion: '1.0';
  generatedAtIso: string;
  policyHashSha256: string;
  wasmBackend: 'wasm' | 'js-fallback';
  documents: ComplianceDocumentRecord[];
  totals: {
    documentsProcessed: number;
    totalRedactions: number;
    categoryCounts: CategoryCountMap;
  };
  packageIntegritySha256: string;
}

export interface BatchRedactionOptions extends RedactionOptions {
  generatedAtIso?: string;
  wasmPath?: string;
}

export interface BatchRedactionResult {
  outputDir: string;
  manifestPath: string;
  manifest: ComplianceManifest;
  writtenFiles: string[];
}
