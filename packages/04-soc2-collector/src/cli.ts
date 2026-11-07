#!/usr/bin/env node
import { enforceLicense } from './license.ts';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateCompliancePosture,
  generateAuditBinderPdf,
  runAuditCollection,
  VaultStore,
  verifyVaultIntegrity
} from './index.ts';
import type { AuditTelemetryInput, CompliancePostureReport } from './types.ts';

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
    'Usage: soc2-collector <subcommand> [options]',
    '',
    'Subcommands:',
    '  collect       --input <telemetry.json> --vault <dir> --key <secret> [--prefix <name>] [--pdf <out.pdf>]',
    '  verify-vault  --vault <dir> --key <secret> [--prefix <name>]',
    '  export-binder --out <binder.pdf> [--vault <dir> --key <secret> | --input <telemetry.json>]'
  ].join('\n');
}

export function runCli(argv: string[], io: CliIo = {}): number {
  const subcommand = argv[0];
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    emit(io.stdout, process.stdout, usageText());
    return subcommand ? 0 : 1;
  }

  const { positional, flags } = parseFlags(argv.slice(1));

  try {
    if (subcommand === 'collect') {
      const inputPath = (flags.get('input') as string | undefined) ?? positional[0];
      const vaultRoot = flags.get('vault') as string | undefined;
      const masterKey = (flags.get('key') as string | undefined) ?? process.env.SOC2_VAULT_KEY;
      const prefix = (flags.get('prefix') as string | undefined) ?? 'evidence';
      const pdfOut = flags.get('pdf') as string | undefined;

      if (!inputPath) {
        emit(io.stderr, process.stderr, `Missing --input telemetry JSON.\n${usageText()}`);
        return 1;
      }

      const telemetry = JSON.parse(readFileSync(path.resolve(inputPath), 'utf8')) as AuditTelemetryInput;

      if (vaultRoot && masterKey) {
        const result = runAuditCollection(telemetry, {
          vaultRoot,
          masterKey,
          prefix,
          binderOutputPath: pdfOut
        });
        emit(
          io.stdout,
          process.stdout,
          JSON.stringify(
            {
              report: result.report,
              vaultEntries: result.manifestEntries.length,
              vaultValid: result.integrity.valid,
              headChainHash: result.integrity.headChainHash
            },
            null,
            2
          )
        );
        return flags.get('strict') === true && result.report.overallStatus === 'FAIL' ? 2 : 0;
      }

      const report = evaluateCompliancePosture(telemetry);
      emit(io.stdout, process.stdout, JSON.stringify(report, null, 2));
      return flags.get('strict') === true && report.overallStatus === 'FAIL' ? 2 : 0;
    }

    if (subcommand === 'verify-vault') {
      const vaultRoot = (flags.get('vault') as string | undefined) ?? positional[0];
      const masterKey = (flags.get('key') as string | undefined) ?? process.env.SOC2_VAULT_KEY;
      const prefix = (flags.get('prefix') as string | undefined) ?? 'evidence';

      if (!vaultRoot || !masterKey) {
        emit(io.stderr, process.stderr, `verify-vault requires --vault <dir> and --key <secret>.\n${usageText()}`);
        return 1;
      }

      const verification = verifyVaultIntegrity(vaultRoot, masterKey, prefix);
      emit(io.stdout, process.stdout, JSON.stringify(verification, null, 2));
      return verification.valid ? 0 : 2;
    }

    if (subcommand === 'export-binder') {
      const outPath = (flags.get('out') as string | undefined) ?? (flags.get('output') as string | undefined);
      const vaultRoot = flags.get('vault') as string | undefined;
      const masterKey = (flags.get('key') as string | undefined) ?? process.env.SOC2_VAULT_KEY;
      const prefix = (flags.get('prefix') as string | undefined) ?? 'evidence';
      const inputPath = (flags.get('input') as string | undefined) ?? positional[0];

      if (!outPath) {
        emit(io.stderr, process.stderr, `export-binder requires --out <binder.pdf>.\n${usageText()}`);
        return 1;
      }

      let report: CompliancePostureReport;
      let entries = [] as ReturnType<VaultStore['listEntries']>;

      if (vaultRoot && masterKey) {
        const store = new VaultStore({ vaultRoot, masterKey, prefix });
        const check = store.verifyIntegrity();
        if (!check.valid) {
          emit(io.stderr, process.stderr, `Vault integrity check failed: ${JSON.stringify(check.failures)}`);
          return 2;
        }
        entries = store.listEntries();
        const reportEntry = [...entries].reverse().find((e) => e.artifactType === 'POSTURE_REPORT');
        if (!reportEntry) {
          emit(io.stderr, process.stderr, 'No POSTURE_REPORT artifact found in vault.');
          return 1;
        }
        report = store.getJsonArtifact<CompliancePostureReport>(reportEntry.artifactId);
      } else if (inputPath) {
        const telemetry = JSON.parse(readFileSync(path.resolve(inputPath), 'utf8')) as AuditTelemetryInput;
        report = evaluateCompliancePosture(telemetry);
      } else {
        emit(
          io.stderr,
          process.stderr,
          `export-binder requires either (--vault and --key) or --input <telemetry.json>.\n${usageText()}`
        );
        return 1;
      }

      const pdfBytes = generateAuditBinderPdf(report, entries);
      const resolvedOut = path.resolve(outPath);
      mkdirSync(path.dirname(resolvedOut), { recursive: true });
      writeFileSync(resolvedOut, pdfBytes);

      emit(
        io.stdout,
        process.stdout,
        JSON.stringify(
          {
            outputPath: resolvedOut,
            byteLength: pdfBytes.length,
            overallStatus: report.overallStatus,
            readinessScore: report.readinessScore
          },
          null,
          2
        )
      );
      return 0;
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
