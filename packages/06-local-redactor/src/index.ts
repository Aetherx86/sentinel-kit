import { detectPiiSpansKernel, redactTextKernel, validateAbaKernel, validateEinKernel, validateIbanKernel, validateLuhnKernel, validateSsnKernel } from './core/kernel.ts';
import { processBatchDirectory } from './adapters/batch.ts';
import { buildCompliancePackage, createSamplePdf, redactPdfBuffer, sha256Hex } from './adapters/pdf-redactor.ts';
import { loadWasmScanner } from './adapters/wasm-bridge.ts';
import type { DetectedPiiSpan, RedactionOptions, TextRedactionResult } from './types.ts';

export type {
  BatchRedactionOptions,
  BatchRedactionResult,
  CategoryCountMap,
  ComplianceDocumentRecord,
  ComplianceManifest,
  CustomRedactionRule,
  DetectedPiiSpan,
  PdfLineSpec,
  PdfRedactionResult,
  PiiCategory,
  RedactionMaskStyle,
  RedactionOptions,
  SamplePdfOptions,
  TextRedactionResult,
  WasmChecksumSpan,
  WasmScannerBridge
} from './types.ts';

export {
  buildCompliancePackage,
  createSamplePdf,
  loadWasmScanner,
  processBatchDirectory,
  redactPdfBuffer,
  sha256Hex
};

export function redactText(text: string, options?: RedactionOptions): TextRedactionResult {
  return redactTextKernel(text, options);
}

export function detectPiiSpans(text: string, options?: RedactionOptions): DetectedPiiSpan[] {
  return detectPiiSpansKernel(text, options);
}

export const checksumValidators = {
  validateSsn: validateSsnKernel,
  validateEin: validateEinKernel,
  validateLuhnPan: validateLuhnKernel,
  validateAbaRouting: validateAbaKernel,
  validateIbanMod97: validateIbanKernel
};
