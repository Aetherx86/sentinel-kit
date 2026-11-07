#!/usr/bin/env node
import { enforceLicense } from './license.ts';
import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateIntakeAndPreAuth } from './core/kernel.ts';
import { buildX12Eligibility270, parseX12Eligibility271 } from './adapters/x12-edi.ts';
import { generateCms1500Precheck } from './adapters/cms1500.ts';
import type { ClinicalIntakeRecord } from './types.ts';

export interface CliWriter {
  write: (chunk: string) => unknown;
}

export interface CliIo {
  stdout?: ((line: string) => void) | CliWriter;
  stderr?: ((line: string) => void) | CliWriter;
}

function emit(target: CliIo['stdout'] | undefined, fallback: NodeJS.WriteStream, text: string): void {
  if (!target) {
    fallback.write(`${text}\n`);
    return;
  }
  if (typeof target === 'function') {
    target(text);
    return;
  }
  target.write(`${text}\n`);
}

function parseFlags(args: string[]): { positional: string[]; flags: Map<string, string | boolean> } {
  const positional: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let i = 0; i < args.length; i++) {
    const token = args[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
    } else {
      positional.push(token);
    }
  }
  return { positional, flags };
}

function usageText(): string {
  return [
    'Usage: clinic-preauth <subcommand> [options]',
    '',
    'Subcommands:',
    '  validate  [--input <intake.json>] [--strict]                 Validate intake, NPI, ICD-10, NCCI, and pre-auth rules',
    '  x12-270   [--input <intake.json>] [--sender ID] [--receiver ID]  Build ANSI X12 005010X279A1 270 eligibility inquiry',
    '  parse-271 [--input <response.271|response.json>]             Parse X12 271 or normalized clearinghouse response',
    '  cms1500   [--input <intake.json>] [--271 <response.271>]     Generate CMS-1500 (02/12) claim pre-check record'
  ].join('\n');
}

export function runCli(argv: string[], io: CliIo = {}): number {
  const subcommand = argv[0];
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    emit(io.stdout, process.stdout, usageText());
    return subcommand ? 0 : 1;
  }

  const { positional, flags } = parseFlags(argv.slice(1));
  const inputPath = (flags.get('input') as string | undefined) ?? positional[0];
  const outputPath = flags.get('output') as string | undefined;

  if (!inputPath) {
    emit(io.stderr, process.stderr, `Missing input file for subcommand "${subcommand}".\n${usageText()}`);
    return 1;
  }

  try {
    const rawContent = readFileSync(path.resolve(inputPath), 'utf8');

    if (subcommand === 'validate') {
      const intake = JSON.parse(rawContent) as ClinicalIntakeRecord;
      const result = validateIntakeAndPreAuth(intake);
      const serialized = JSON.stringify(result, null, 2);
      if (outputPath) writeFileSync(path.resolve(outputPath), serialized, 'utf8');
      emit(io.stdout, process.stdout, serialized);
      return flags.get('strict') === true && !result.valid ? 2 : 0;
    }

    if (subcommand === 'x12-270') {
      const intake = JSON.parse(rawContent) as ClinicalIntakeRecord;
      const senderId = (flags.get('sender') as string | undefined) ?? 'CLINICPREAUTH';
      const receiverId = (flags.get('receiver') as string | undefined) ?? intake.coverage.payerId;
      const icn = (flags.get('icn') as string | undefined) ?? '000000001';
      const built = buildX12Eligibility270(intake, {
        senderId,
        receiverId,
        interchangeControlNumber: icn,
        groupControlNumber: '1',
        transactionControlNumber: '0001'
      });
      const outText = flags.get('raw') === true ? built.edi : JSON.stringify(built, null, 2);
      if (outputPath) writeFileSync(path.resolve(outputPath), outText, 'utf8');
      emit(io.stdout, process.stdout, outText);
      return 0;
    }

    if (subcommand === 'parse-271') {
      const parsed = parseX12Eligibility271(rawContent);
      const serialized = JSON.stringify(parsed, null, 2);
      if (outputPath) writeFileSync(path.resolve(outputPath), serialized, 'utf8');
      emit(io.stdout, process.stdout, serialized);
      return 0;
    }

    if (subcommand === 'cms1500') {
      const intake = JSON.parse(rawContent) as ClinicalIntakeRecord;
      const path271 = flags.get('271') as string | undefined;
      const eligibility = path271
        ? parseX12Eligibility271(readFileSync(path.resolve(path271), 'utf8'))
        : undefined;
      const precheck = generateCms1500Precheck(intake, eligibility);
      const serialized = JSON.stringify(precheck, null, 2);
      if (outputPath) writeFileSync(path.resolve(outputPath), serialized, 'utf8');
      emit(io.stdout, process.stdout, serialized);
      return flags.get('strict') === true && !precheck.claimReady ? 2 : 0;
    }

    emit(io.stderr, process.stderr, `Unknown subcommand "${subcommand}".\n${usageText()}`);
    return 1;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit(io.stderr, process.stderr, `Execution error: ${message}`);
    return 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  enforceLicense('sentinel-kit');
  process.exitCode = runCli(process.argv.slice(2));
}
