#!/usr/bin/env node
import { enforceLicense } from './license.ts';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCompliancePackage, processBatchDirectory, redactPdfBuffer, redactText } from './index.ts';
import type { CustomRedactionRule, RedactionMaskStyle, RedactionOptions } from './types.ts';

export interface CliIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function parseSharedOptions(args: string[]): RedactionOptions {
  const styleRaw = getFlag(args, '--mask-style');
  const maskStyle: RedactionMaskStyle = styleRaw === 'preserve-length' ? 'preserve-length' : 'token';
  const customLiteral = getFlag(args, '--custom-literal');
  const customRegex = getFlag(args, '--custom-regex');
  const customRules: CustomRedactionRule[] = [];

  if (customLiteral) {
    customRules.push({
      id: 'cli_literal',
      label: 'FIRM_TERM',
      pattern: customLiteral,
      literal: true
    });
  }
  if (customRegex) {
    customRules.push({
      id: 'cli_regex',
      label: 'FIRM_PATTERN',
      pattern: customRegex
    });
  }

  return {
    maskStyle,
    customRules: customRules.length > 0 ? customRules : undefined
  };
}

function printUsage(io: CliIo): void {
  io.stderr(
    [
      'Usage: local-redactor <command> [options]',
      '',
      'Commands:',
      '  redact-text --input <path> [--output <path>] [--mask-style token|preserve-length] [--custom-literal <str>]',
      '  redact-pdf  --input <path> --output <path> [--manifest <path>] [--mask-style token|preserve-length]',
      '  batch       --input-dir <dir> --output-dir <dir> [--mask-style token|preserve-length]'
    ].join('\n') + '\n'
  );
}

export async function runCli(argv: string[], io?: CliIo): Promise<number> {
  const writer: CliIo = io ?? {
    stdout: (text: string) => process.stdout.write(text),
    stderr: (text: string) => process.stderr.write(text)
  };

  const [subcommand, ...rest] = argv;
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    printUsage(writer);
    return subcommand ? 0 : 1;
  }

  try {
    const options = parseSharedOptions(rest);

    if (subcommand === 'redact-text') {
      const inputPath = getFlag(rest, '--input');
      if (!inputPath) {
        writer.stderr('Missing required flag: --input <path>\n');
        return 1;
      }
      const raw = readFileSync(resolve(inputPath), 'utf8');
      const result = redactText(raw, options);
      const outputPath = getFlag(rest, '--output');
      if (outputPath) {
        writeFileSync(resolve(outputPath), result.redactedText, 'utf8');
        writer.stdout(
          JSON.stringify(
            {
              outputPath: resolve(outputPath),
              totalRedactions: result.totalRedactions,
              categoryCounts: result.categoryCounts
            },
            null,
            2
          ) + '\n'
        );
      } else {
        writer.stdout(result.redactedText);
      }
      return 0;
    }

    if (subcommand === 'redact-pdf') {
      const inputPath = getFlag(rest, '--input');
      const outputPath = getFlag(rest, '--output');
      if (!inputPath || !outputPath) {
        writer.stderr('Missing required flags: --input <path> --output <path>\n');
        return 1;
      }
      const inBuf = readFileSync(resolve(inputPath));
      const pdfRes = redactPdfBuffer(inBuf, options);
      writeFileSync(resolve(outputPath), pdfRes.pdfBuffer);

      const manifestOut = getFlag(rest, '--manifest');
      const manifest = buildCompliancePackage({
        documents: [
          {
            documentName: basename(inputPath),
            format: 'pdf',
            inputBytes: inBuf,
            outputBytes: pdfRes.pdfBuffer,
            totalRedactions: pdfRes.totalRedactions,
            categoryCounts: pdfRes.categoryCounts
          }
        ],
        options
      });
      if (manifestOut) {
        writeFileSync(resolve(manifestOut), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
      }

      writer.stdout(
        JSON.stringify(
          {
            outputPath: resolve(outputPath),
            totalRedactions: pdfRes.totalRedactions,
            categoryCounts: pdfRes.categoryCounts,
            streamsModified: pdfRes.streamsModified,
            packageIntegritySha256: manifest.packageIntegritySha256
          },
          null,
          2
        ) + '\n'
      );
      return 0;
    }

    if (subcommand === 'batch') {
      const inDir = getFlag(rest, '--input-dir');
      const outDir = getFlag(rest, '--output-dir');
      if (!inDir || !outDir) {
        writer.stderr('Missing required flags: --input-dir <dir> --output-dir <dir>\n');
        return 1;
      }
      const batchRes = await processBatchDirectory(inDir, outDir, options);
      writer.stdout(
        JSON.stringify(
          {
            outputDir: batchRes.outputDir,
            manifestPath: batchRes.manifestPath,
            documentsProcessed: batchRes.manifest.totals.documentsProcessed,
            totalRedactions: batchRes.manifest.totals.totalRedactions,
            wasmBackend: batchRes.manifest.wasmBackend
          },
          null,
          2
        ) + '\n'
      );
      return 0;
    }

    writer.stderr(`Unknown command: ${subcommand}\n`);
    printUsage(writer);
    return 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    writer.stderr(`Error: ${msg}\n`);
    return 1;
  }
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  enforceLicense('sentinel-kit');
  runCli(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
