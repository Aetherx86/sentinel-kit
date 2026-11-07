#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeSavingsInvoice, detectZombieRuns, planMatrixExecution } from './index.ts';
import { enforceLicense } from './license.ts';
import type {
  CellTelemetry,
  CliIO,
  InFlightWorkflowRun,
  LedgerEvent,
  MatrixCell,
  PricingModel,
  RepoTier,
  WorkflowMatrixSpec,
  WorkspacePackage
} from './types.ts';

function defaultIO(): Required<CliIO> {
  return {
    stdout: (msg: string) => {
      process.stdout.write(msg);
    },
    stderr: (msg: string) => {
      process.stderr.write(msg);
    },
    cwd: process.cwd()
  };
}

interface ParsedFlags {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseFlags(argv: string[]): ParsedFlags {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq > 0) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('-')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg === '-h') {
      flags.help = true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function resolveFile(cwd: string, p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(cwd, p);
}

function readJsonFile<T>(cwd: string, filePath: string): T {
  const raw = fs.readFileSync(resolveFile(cwd, filePath), 'utf8');
  return JSON.parse(raw) as T;
}

function formatUsage(): string {
  return [
    'Usage: matrix-pruner <command> [options]',
    '',
    'Commands:',
    '  prune    Compute minimal CI matrix execution plan from a git diff',
    '  zombies  Identify superseded or stalled in-flight workflow runs',
    '  quote    Calculate monthly compute savings and invoice fee',
    '',
    'Options (prune):',
    '  --diff <path>         Path to unified git diff or changed-files list',
    '  --matrix <path>       Path to GitHub Actions YAML or matrix JSON file',
    '  --packages <path>     Optional workspace package graph JSON',
    '  --telemetry <path>    Optional historical cell telemetry JSON',
    '  --threshold <0..1>    Risk score cutoff (default: 0.28)',
    '  --no-doc-smoke        Skip smoke anchor on documentation-only diffs',
    '  --json                Emit machine-readable JSON output',
    '',
    'Options (zombies):',
    '  --runs <path>         Path to in-flight runs JSON array',
    '  --p95-multiplier <n>  Runtime p95 multiplier cutoff (default: 1.5)',
    '  --stall-minutes <n>   Log inactivity timeout in minutes (default: 15)',
    '  --json                Emit machine-readable JSON output',
    '',
    'Options (quote):',
    '  --events <path>       Path to ledger events JSON array',
    '  --contributors <n>    Active monthly repository contributors (default: 10)',
    '  --tier <tier>         Explicit tier override: starter | growth | scale',
    '  --month <YYYY-MM>     Billing period label (default: 2026-11)',
    '  --model <mode>        savings-share | flat-tier | best-for-customer',
    '  --json                Emit machine-readable JSON output',
    ''
  ].join('\n');
}

export function runCli(argv: string[], io?: CliIO): number {
  const activeIo: Required<CliIO> = {
    ...defaultIO(),
    ...io
  };
  const { positional, flags } = parseFlags(argv);
  const subcommand = positional[0];
  const asJson = Boolean(flags.json);

  if (!subcommand || flags.help) {
    activeIo.stdout(formatUsage());
    return subcommand ? 0 : 1;
  }

  try {
    if (subcommand === 'prune') {
      const diffPath = typeof flags.diff === 'string' ? flags.diff : undefined;
      const matrixPath = typeof flags.matrix === 'string' ? flags.matrix : undefined;
      if (!diffPath || !matrixPath) {
        activeIo.stderr('Error: prune requires both --diff <path> and --matrix <path>\n');
        return 2;
      }

      const diffRaw = fs.readFileSync(resolveFile(activeIo.cwd, diffPath), 'utf8');
      const matrixRaw = fs.readFileSync(resolveFile(activeIo.cwd, matrixPath), 'utf8');
      let matrixInput: MatrixCell[] | WorkflowMatrixSpec | string = matrixRaw;
      if (matrixPath.endsWith('.json')) {
        const parsed = JSON.parse(matrixRaw) as unknown;
        if (Array.isArray(parsed)) {
          matrixInput = parsed as MatrixCell[];
        } else {
          matrixInput = parsed as WorkflowMatrixSpec;
        }
      }

      const packages =
        typeof flags.packages === 'string'
          ? readJsonFile<WorkspacePackage[]>(activeIo.cwd, flags.packages)
          : undefined;
      const telemetry =
        typeof flags.telemetry === 'string'
          ? readJsonFile<CellTelemetry[]>(activeIo.cwd, flags.telemetry)
          : undefined;
      const riskThreshold =
        typeof flags.threshold === 'string' ? Number(flags.threshold) : undefined;
      const keepSmokeOnDocsOnly = flags['no-doc-smoke'] ? false : true;

      const plan = planMatrixExecution({
        diff: diffRaw,
        matrix: matrixInput,
        packages,
        telemetry,
        riskThreshold,
        keepSmokeOnDocsOnly
      });

      if (asJson) {
        activeIo.stdout(`${JSON.stringify(plan, null, 2)}\n`);
      } else {
        const lines = [
          `Mode: ${plan.changeMode}`,
          `Selected: ${plan.summary.selectedCount}/${plan.summary.totalCells} cells (pruned ${(plan.summary.pruneRatio * 100).toFixed(1)}%)`,
          `Minutes saved: ${plan.summary.savedMinutes} min ($${plan.summary.savedCostUsd.toFixed(4)} saved)`,
          `Anchor cell: ${plan.anchorCellId ?? 'none'}`,
          ...plan.decisions.map(
            (d) =>
              `  [${d.action}] ${d.cell.id} reason=${d.reason} risk=${d.riskScore.toFixed(3)} flake=${d.flakeIndex.toFixed(3)}`
          )
        ];
        activeIo.stdout(`${lines.join('\n')}\n`);
      }
      return 0;
    }

    if (subcommand === 'zombies') {
      const runsPath = typeof flags.runs === 'string' ? flags.runs : undefined;
      if (!runsPath) {
        activeIo.stderr('Error: zombies requires --runs <path>\n');
        return 2;
      }
      const runs = readJsonFile<InFlightWorkflowRun[]>(activeIo.cwd, runsPath);
      const p95Multiplier =
        typeof flags['p95-multiplier'] === 'string'
          ? Number(flags['p95-multiplier'])
          : undefined;
      const stallThresholdMinutes =
        typeof flags['stall-minutes'] === 'string'
          ? Number(flags['stall-minutes'])
          : undefined;

      const report = detectZombieRuns(runs, { p95Multiplier, stallThresholdMinutes });
      if (asJson) {
        activeIo.stdout(`${JSON.stringify(report, null, 2)}\n`);
      } else {
        const lines = [
          `Active head runs: ${report.activeHeadRuns.length}`,
          `Cancel actions: ${report.cancelActions.length} (${report.totalWastedMinutesAvoided} min saved)`,
          ...report.cancelActions.map(
            (c) =>
              `  [CANCEL] run=${c.runId}${c.jobId ? ` job=${c.jobId}` : ''} reason=${c.reason} saved=${c.wastedMinutesAvoided}m`
          )
        ];
        activeIo.stdout(`${lines.join('\n')}\n`);
      }
      return 0;
    }

    if (subcommand === 'quote') {
      const eventsPath = typeof flags.events === 'string' ? flags.events : undefined;
      if (!eventsPath) {
        activeIo.stderr('Error: quote requires --events <path>\n');
        return 2;
      }
      const events = readJsonFile<LedgerEvent[]>(activeIo.cwd, eventsPath);
      const activeContributors =
        typeof flags.contributors === 'string' ? Number(flags.contributors) : 10;
      const repoSizeTier =
        flags.tier === 'starter' || flags.tier === 'growth' || flags.tier === 'scale'
          ? (flags.tier as RepoTier)
          : undefined;
      const month = typeof flags.month === 'string' ? flags.month : '2026-11';
      const pricingModel =
        flags.model === 'savings-share' ||
        flags.model === 'flat-tier' ||
        flags.model === 'best-for-customer'
          ? (flags.model as PricingModel)
          : 'best-for-customer';

      const invoice = computeSavingsInvoice({
        month,
        activeContributors,
        repoSizeTier,
        events,
        pricingModel
      });

      if (asJson) {
        activeIo.stdout(`${JSON.stringify(invoice, null, 2)}\n`);
      } else {
        const lines = [
          `Billing period: ${invoice.month} (tier: ${invoice.tier})`,
          `Gross compute saved: $${invoice.grossComputeSavedUsd.toFixed(2)}`,
          `20% savings-share fee: $${invoice.savingsShareFeeUsd.toFixed(2)} | Flat tier cap: $${invoice.flatTierFeeUsd.toFixed(2)}`,
          `Effective invoice (${invoice.billingModeApplied}): $${invoice.effectiveFeeUsd.toFixed(2)}`
        ];
        activeIo.stdout(`${lines.join('\n')}\n`);
      }
      return 0;
    }

    activeIo.stderr(`Error: unknown subcommand "${subcommand}"\n`);
    return 2;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    activeIo.stderr(`Error: ${message}\n`);
    return 1;
  }
}

const isDirectCli = ((): boolean => {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return (
      fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
})();

if (isDirectCli) {
  enforceLicense('sentinel-kit');
  process.exitCode = runCli(process.argv.slice(2));
}
