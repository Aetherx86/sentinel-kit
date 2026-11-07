import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { redactTextKernel } from '../core/kernel.ts';
import { buildCompliancePackage, redactPdfBuffer } from './pdf-redactor.ts';
import { loadWasmScanner } from './wasm-bridge.ts';
import type { BatchRedactionOptions, BatchRedactionResult, CategoryCountMap, ComplianceDocumentRecord, PiiCategory, RedactionOptions } from '../types.ts';

const SUPPORTED_EXTS = new Map<string, ComplianceDocumentRecord['format']>([
  ['.pdf', 'pdf'],
  ['.txt', 'txt'],
  ['.csv', 'csv'],
  ['.json', 'json'],
  ['.md', 'md']
]);

function collectFilesRecursively(dir: string, acc: string[]): void {
  const entries = readdirSync(dir).sort();
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectFilesRecursively(full, acc);
    } else if (st.isFile() && SUPPORTED_EXTS.has(extname(name).toLowerCase())) {
      acc.push(full);
    }
  }
}

function mergeCategoryCounts(target: CategoryCountMap, addition: CategoryCountMap): void {
  for (const key of Object.keys(addition) as PiiCategory[]) {
    target[key] = (target[key] ?? 0) + (addition[key] ?? 0);
  }
}

function redactJsonValue(
  value: unknown,
  options: RedactionOptions | undefined,
  counts: CategoryCountMap
): { value: unknown; redactions: number } {
  if (typeof value === 'string') {
    const res = redactTextKernel(value, options);
    mergeCategoryCounts(counts, res.categoryCounts);
    return { value: res.redactedText, redactions: res.totalRedactions };
  }
  if (Array.isArray(value)) {
    let total = 0;
    const next = value.map((item) => {
      const r = redactJsonValue(item, options, counts);
      total += r.redactions;
      return r.value;
    });
    return { value: next, redactions: total };
  }
  if (typeof value === 'object' && value !== null) {
    let total = 0;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const r = redactJsonValue(v, options, counts);
      total += r.redactions;
      out[k] = r.value;
    }
    return { value: out, redactions: total };
  }
  return { value, redactions: 0 };
}

export async function processBatchDirectory(
  inputDir: string,
  outputDir: string,
  options?: BatchRedactionOptions
): Promise<BatchRedactionResult> {
  const absIn = resolve(inputDir);
  const absOut = resolve(outputDir);
  mkdirSync(absOut, { recursive: true });

  const scanner = await loadWasmScanner(options?.wasmPath ? { wasmPath: options.wasmPath } : undefined);
  const files: string[] = [];
  collectFilesRecursively(absIn, files);

  const manifestDocs: Array<{
    documentName: string;
    format: ComplianceDocumentRecord['format'];
    inputBytes: Buffer;
    outputBytes: Buffer;
    totalRedactions: number;
    categoryCounts: CategoryCountMap;
  }> = [];
  const writtenFiles: string[] = [];

  for (const filePath of files) {
    const relName = relative(absIn, filePath).replace(/\\/g, '/');
    const ext = extname(filePath).toLowerCase();
    const format = SUPPORTED_EXTS.get(ext)!;
    const inputBytes = readFileSync(filePath);
    const destPath = join(absOut, 'documents', relName);
    mkdirSync(join(destPath, '..'), { recursive: true });

    let outputBytes: Buffer;
    let totalRedactions = 0;
    let categoryCounts: CategoryCountMap = {};

    if (format === 'pdf') {
      const pdfRes = redactPdfBuffer(inputBytes, options);
      outputBytes = pdfRes.pdfBuffer;
      totalRedactions = pdfRes.totalRedactions;
      categoryCounts = pdfRes.categoryCounts;
    } else if (format === 'json') {
      const rawText = inputBytes.toString('utf8');
      try {
        const parsed: unknown = JSON.parse(rawText);
        const counts: CategoryCountMap = {};
        const scrubbed = redactJsonValue(parsed, options, counts);
        outputBytes = Buffer.from(JSON.stringify(scrubbed.value, null, 2) + '\n', 'utf8');
        totalRedactions = scrubbed.redactions;
        categoryCounts = counts;
      } catch {
        const textRes = redactTextKernel(rawText, options);
        outputBytes = Buffer.from(textRes.redactedText, 'utf8');
        totalRedactions = textRes.totalRedactions;
        categoryCounts = textRes.categoryCounts;
      }
    } else {
      const textRes = redactTextKernel(inputBytes.toString('utf8'), options);
      outputBytes = Buffer.from(textRes.redactedText, 'utf8');
      totalRedactions = textRes.totalRedactions;
      categoryCounts = textRes.categoryCounts;
    }

    writeFileSync(destPath, outputBytes);
    writtenFiles.push(destPath);
    manifestDocs.push({
      documentName: relName,
      format,
      inputBytes,
      outputBytes,
      totalRedactions,
      categoryCounts
    });
  }

  const manifest = buildCompliancePackage({
    documents: manifestDocs,
    options,
    wasmBackend: scanner.backend,
    generatedAtIso: options?.generatedAtIso
  });

  const manifestPath = join(absOut, 'redaction-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  return {
    outputDir: absOut,
    manifestPath,
    manifest,
    writtenFiles
  };
}
