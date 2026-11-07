#!/usr/bin/env node
import { enforceLicense } from './license.ts';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { estimateTierPlan, evaluateStockTransition, extractStorefrontSnapshot } from './index.ts';
import type { CatalogSnapshot } from './types.ts';

export interface CliIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function loadSnapshotsFromFile(filePath: string, fallbackUrl: string, capturedAtMs: number): CatalogSnapshot[] {
  const raw = readFileSync(resolve(filePath), 'utf8');
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'snapshots' in parsed &&
        Array.isArray((parsed as { snapshots: unknown }).snapshots)
      ) {
        return (parsed as { snapshots: CatalogSnapshot[] }).snapshots;
      }
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === 'object' &&
        parsed[0] !== null &&
        'variants' in parsed[0] &&
        'productId' in parsed[0]
      ) {
        return parsed as CatalogSnapshot[];
      }
    } catch {
      // Fall through to raw storefront extractor
    }
  }
  const result = extractStorefrontSnapshot({
    url: fallbackUrl,
    body: raw,
    capturedAtMs
  });
  return result.snapshots;
}

function printUsage(io: CliIo): void {
  io.stderr(
    [
      'Usage: stock-sentinel <command> [options]',
      '',
      'Commands:',
      '  extract   --input <path> [--url <url>] [--status <code>]',
      '  diff      --prev <path> --curr <path> [--url <url>] [--confirm-ticks <n>] [--min-drop-bps <n>]',
      '  plan-tier --skus <count> --interval <seconds>'
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
    if (subcommand === 'extract') {
      const inputPath = getFlag(rest, '--input');
      if (!inputPath) {
        writer.stderr('Missing required flag: --input <path>\n');
        return 1;
      }
      const sourceUrl = getFlag(rest, '--url') ?? 'https://store.example/catalog';
      const statusCode = Number.parseInt(getFlag(rest, '--status') ?? '200', 10);
      const body = readFileSync(resolve(inputPath), 'utf8');
      const result = extractStorefrontSnapshot({
        url: sourceUrl,
        statusCode: Number.isFinite(statusCode) ? statusCode : 200,
        body,
        capturedAtMs: Date.now()
      });
      writer.stdout(JSON.stringify(result, null, 2) + '\n');
      return result.ok ? 0 : 2;
    }

    if (subcommand === 'diff') {
      const prevPath = getFlag(rest, '--prev');
      const currPath = getFlag(rest, '--curr');
      if (!prevPath || !currPath) {
        writer.stderr('Missing required flags: --prev <path> --curr <path>\n');
        return 1;
      }
      const sourceUrl = getFlag(rest, '--url') ?? 'https://store.example/catalog';
      const confirmTicks = Number.parseInt(getFlag(rest, '--confirm-ticks') ?? '1', 10);
      const minDropBps = Number.parseInt(getFlag(rest, '--min-drop-bps') ?? '500', 10);

      const t0 = 1_700_000_000_000;
      const prevSnaps = loadSnapshotsFromFile(prevPath, sourceUrl, t0);
      const currSnaps = loadSnapshotsFromFile(currPath, sourceUrl, t0 + 30_000);

      const seeded = evaluateStockTransition(null, prevSnaps, {
        evaluatedAtMs: t0,
        config: {
          restockConfirmTicks: confirmTicks,
          outOfStockConfirmTicks: confirmTicks,
          minPriceDropBps: minDropBps
        }
      });
      const diffed = evaluateStockTransition(seeded.state, currSnaps, {
        evaluatedAtMs: t0 + 30_000,
        config: {
          restockConfirmTicks: confirmTicks,
          outOfStockConfirmTicks: confirmTicks,
          minPriceDropBps: minDropBps
        }
      });
      writer.stdout(
        JSON.stringify(
          {
            alerts: diffed.alerts,
            suppressedFlaps: diffed.suppressedFlaps,
            pollTick: diffed.state.pollTick
          },
          null,
          2
        ) + '\n'
      );
      return 0;
    }

    if (subcommand === 'plan-tier') {
      const skusRaw = getFlag(rest, '--skus');
      const intervalRaw = getFlag(rest, '--interval');
      if (!skusRaw || !intervalRaw) {
        writer.stderr('Missing required flags: --skus <count> --interval <seconds>\n');
        return 1;
      }
      const plan = estimateTierPlan(Number.parseInt(skusRaw, 10), Number.parseInt(intervalRaw, 10));
      writer.stdout(JSON.stringify(plan, null, 2) + '\n');
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
