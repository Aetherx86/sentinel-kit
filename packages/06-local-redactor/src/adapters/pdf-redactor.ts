import { createHash } from 'node:crypto';
import { deflateSync, inflateRawSync, inflateSync } from 'node:zlib';
import { buildSamplePdfKernel, rebuildPdfBinaryKernel } from '../core/kernel.ts';
import type { CategoryCountMap, ComplianceDocumentRecord, ComplianceManifest, PdfRedactionResult, PiiCategory, RedactionOptions, SamplePdfOptions } from '../types.ts';

function inflatePdfStream(data: Uint8Array): Uint8Array {
  try {
    return inflateSync(data);
  } catch {
    return inflateRawSync(data);
  }
}

function deflatePdfStream(data: Uint8Array): Uint8Array {
  return deflateSync(data, { level: 9 });
}

export function redactPdfBuffer(
  inputPdf: Buffer | Uint8Array,
  options?: RedactionOptions
): PdfRedactionResult {
  const result = rebuildPdfBinaryKernel(inputPdf, inflatePdfStream, deflatePdfStream, options);
  return {
    pdfBuffer: Buffer.from(result.outputBytes),
    totalRedactions: result.totalRedactions,
    categoryCounts: result.categoryCounts,
    streamsInspected: result.streamsInspected,
    streamsModified: result.streamsModified
  };
}

export function createSamplePdf(options: SamplePdfOptions): Buffer {
  return buildSamplePdfKernel(options, deflatePdfStream);
}

export function sha256Hex(data: Uint8Array | string): string {
  const hash = createHash('sha256');
  if (typeof data === 'string') hash.update(data, 'utf8');
  else hash.update(data);
  return hash.digest('hex');
}

function computePolicyHash(options?: RedactionOptions): string {
  const canonical = {
    categories: options?.categories ? [...options.categories].sort() : 'ALL',
    maskStyle: options?.maskStyle ?? 'token',
    maskChar: options?.maskChar ?? '#',
    customRules: (options?.customRules ?? []).map((r) => ({
      id: r.id,
      label: r.label ?? r.id,
      literal: Boolean(r.literal),
      caseInsensitive: Boolean(r.caseInsensitive),
      patternHash: sha256Hex(r.pattern instanceof RegExp ? r.pattern.source : r.pattern)
    }))
  };
  return sha256Hex(JSON.stringify(canonical));
}

export function buildCompliancePackage(params: {
  documents: Array<{
    documentName: string;
    format: ComplianceDocumentRecord['format'];
    inputBytes: Uint8Array | Buffer;
    outputBytes: Uint8Array | Buffer;
    totalRedactions: number;
    categoryCounts: CategoryCountMap;
  }>;
  options?: RedactionOptions;
  wasmBackend?: 'wasm' | 'js-fallback';
  generatedAtIso?: string;
}): ComplianceManifest {
  const generatedAtIso = params.generatedAtIso ?? new Date().toISOString();
  const policyHashSha256 = computePolicyHash(params.options);
  const wasmBackend = params.wasmBackend ?? 'js-fallback';

  const aggregateCounts: CategoryCountMap = {};
  let aggregateRedactions = 0;

  const docRecords: ComplianceDocumentRecord[] = params.documents.map((doc) => {
    aggregateRedactions += doc.totalRedactions;
    for (const key of Object.keys(doc.categoryCounts) as PiiCategory[]) {
      aggregateCounts[key] = (aggregateCounts[key] ?? 0) + (doc.categoryCounts[key] ?? 0);
    }
    return {
      documentName: doc.documentName,
      format: doc.format,
      inputBytes: doc.inputBytes.byteLength,
      outputBytes: doc.outputBytes.byteLength,
      inputSha256: sha256Hex(doc.inputBytes),
      outputSha256: sha256Hex(doc.outputBytes),
      totalRedactions: doc.totalRedactions,
      categoryCounts: { ...doc.categoryCounts }
    };
  });

  const integrityPayload = JSON.stringify({
    schemaVersion: '1.0',
    policyHashSha256,
    documents: docRecords.map((d) => ({
      documentName: d.documentName,
      inputSha256: d.inputSha256,
      outputSha256: d.outputSha256,
      totalRedactions: d.totalRedactions
    }))
  });

  return {
    schemaVersion: '1.0',
    generatedAtIso,
    policyHashSha256,
    wasmBackend,
    documents: docRecords,
    totals: {
      documentsProcessed: docRecords.length,
      totalRedactions: aggregateRedactions,
      categoryCounts: aggregateCounts
    },
    packageIntegritySha256: sha256Hex(integrityPayload)
  };
}
