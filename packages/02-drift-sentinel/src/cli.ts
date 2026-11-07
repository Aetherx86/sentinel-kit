import { readFileSync, existsSync } from 'node:fs';
import { enforceLicense } from './license.ts';
import { resolve } from 'node:path';
import {
  analyzeMigrationSafety,
  compareSchemaCatalogs,
  runPreflightCheck
} from './index.ts';
import type { CliIO } from './types.ts';

export async function runCli(argv: string[], io: CliIO = { stdout: console.log, stderr: console.error }): Promise<number> {
  const args = [...argv];
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
    io.stdout([
      'Usage: drift-sentinel <command> [options]',
      '',
      'Commands:',
      '  check-sql <path>              Analyze migration file or directory for lock hazards',
      '  diff-schema <exp> <act>       Detect drift between expected and actual schema catalogs',
      '  preflight                     Run integrated pre-deployment flight check',
      '',
      'Options:',
      '  --engine-version <n>          Target PostgreSQL major version (default: 15)',
      '  --catalog <path>              Base schema catalog JSON file for contextual analysis',
      '  --expected <path>             Expected schema catalog JSON (for preflight)',
      '  --actual <path>               Actual / live schema catalog JSON (for preflight)',
      '  --migrations <path>           Migration directory or SQL file (for preflight)',
      '  --json                        Format output as machine-readable JSON',
      '  --help                        Display this manual',
      ''
    ].join('\n'));
    return 0;
  }

  const isJson = args.includes('--json');
  function getFlag(flag: string): string | undefined {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) {
      return args[idx + 1];
    }
    return undefined;
  }

  const engineVersion = Number(getFlag('--engine-version')) || 15;
  const catalogPath = getFlag('--catalog');

  if (cmd === 'check-sql') {
    const target = args[1];
    if (!target) {
      io.stderr('Error: missing path to migration file or directory');
      return 2;
    }
    try {
      const report = analyzeMigrationSafety(target, {
        engineVersion,
        catalog: catalogPath
      });

      if (isJson) {
        io.stdout(JSON.stringify(report, null, 2));
      } else {
        io.stdout(`[drift-sentinel] Analyzed ${report.statementCount} statements across target (Postgres ${report.engineVersion})`);
        io.stdout(`Overall Safety: ${report.severity} (exit code ${report.exitCode})`);
        if (report.hazards.length === 0) {
          io.stdout('No blocking DDL hazards or locking violations detected.');
        } else {
          io.stdout(`Detected ${report.hazards.length} hazard(s):`);
          for (const h of report.hazards) {
            io.stdout(`  - [${h.severity}] ${h.code} on line ${h.line} (table: ${h.tableName || 'N/A'}, lock: ${h.lockMode})`);
            io.stdout(`    Reason: ${h.message}`);
            io.stdout(`    Fix:    ${h.remediation}`);
          }
        }
      }
      return report.exitCode;
    } catch (err: any) {
      io.stderr(`Execution error: ${err.message}`);
      return 2;
    }
  }

  if (cmd === 'diff-schema') {
    const expPath = args[1];
    const actPath = args[2];
    if (!expPath || !actPath) {
      io.stderr('Error: diff-schema requires <expected.json> and <actual.json> paths');
      return 2;
    }
    try {
      const report = compareSchemaCatalogs(expPath, actPath);
      if (isJson) {
        io.stdout(JSON.stringify(report, null, 2));
      } else {
        io.stdout(`[drift-sentinel] Catalog comparison: ${report.hasDrift ? 'DRIFT DETECTED' : 'IN SYNC'}`);
        io.stdout(`Expected hash: ${report.expectedFingerprint}`);
        io.stdout(`Actual hash:   ${report.actualFingerprint}`);
        io.stdout(`Severity:      ${report.severity} (exit code ${report.exitCode})`);
        if (report.items.length > 0) {
          io.stdout(`Drift items (${report.items.length}):`);
          for (const it of report.items) {
            io.stdout(`  - [${it.severity}] ${it.kind}: ${it.description}`);
          }
        }
      }
      return report.exitCode;
    } catch (err: any) {
      io.stderr(`Execution error: ${err.message}`);
      return 2;
    }
  }

  if (cmd === 'preflight') {
    const migrationsPath = getFlag('--migrations');
    const expPath = getFlag('--expected');
    const actPath = getFlag('--actual');

    try {
      const report = runPreflightCheck({
        migrations: migrationsPath,
        expectedSchema: expPath,
        actualSchema: actPath,
        engineVersion
      });

      if (isJson) {
        io.stdout(JSON.stringify(report, null, 2));
      } else {
        io.stdout(`[drift-sentinel] Preflight result: ${report.severity} (exit code ${report.exitCode})`);
        if (report.migrationReport) {
          io.stdout(`  Migrations checked: ${report.migrationReport.statementCount} statements, ${report.migrationReport.hazards.length} hazards`);
        }
        if (report.driftReport) {
          io.stdout(`  Drift check: ${report.driftReport.hasDrift ? 'drift detected' : 'clean'}, ${report.driftReport.items.length} items`);
        }
      }
      return report.exitCode;
    } catch (err: any) {
      io.stderr(`Preflight error: ${err.message}`);
      return 2;
    }
  }

  io.stderr(`Unknown command: ${cmd}`);
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  enforceLicense('sentinel-kit');
  runCli(process.argv.slice(2)).then((code) => {
    process.exit(code);
  });
}
