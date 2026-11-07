import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { executePruningKernel } from './core/kernel.ts';
import type { KernelCellInput } from './core/kernel.ts';
import { analyzeDiffImpact, classifyChangedFile, parseGitDiff } from './adapters/git-diff.ts';
import { detectZombieRuns, expandWorkflowMatrix, parseWorkflowSpec } from './adapters/workflow.ts';
import { computeSavingsInvoice, estimateCellCostUsd, getRunnerMinuteRateUsd, resolveRepoTier } from './adapters/billing.ts';
import type {
  CellTelemetry,
  EvaluatedCell,
  InFlightWorkflowRun,
  MatrixCell,
  MatrixExecutionPlan,
  MatrixExecutionPlanInput,
  WebhookRequest,
  WebhookResponse
} from './types.ts';

export type * from './types.ts';
export { analyzeDiffImpact, classifyChangedFile, parseGitDiff } from './adapters/git-diff.ts';
export { detectZombieRuns, expandWorkflowMatrix, parseWorkflowSpec } from './adapters/workflow.ts';
export { computeSavingsInvoice, estimateCellCostUsd, getRunnerMinuteRateUsd, resolveRepoTier } from './adapters/billing.ts';

function matchTelemetry(cell: MatrixCell, telemetryList: CellTelemetry[]): CellTelemetry | undefined {
  for (const item of telemetryList) {
    if (item.cellId && item.cellId === cell.id) {
      return item;
    }
  }
  for (const item of telemetryList) {
    if (
      !item.cellId &&
      item.targetPackage &&
      item.suite &&
      item.targetPackage === cell.targetPackage &&
      item.suite === cell.suite
    ) {
      return item;
    }
  }
  for (const item of telemetryList) {
    if (!item.cellId && !item.targetPackage && item.suite && item.suite === cell.suite) {
      return item;
    }
  }
  for (const item of telemetryList) {
    if (!item.cellId && !item.suite && item.targetPackage && item.targetPackage === cell.targetPackage) {
      return item;
    }
  }
  return undefined;
}

function round4(n: number): number {
  return Math.round((n + Number.EPSILON) * 10000) / 10000;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function planMatrixExecution(input: MatrixExecutionPlanInput): MatrixExecutionPlan {
  const packages = input.packages ?? [];
  const provider = input.defaultProvider ?? 'github';
  const impact = analyzeDiffImpact(input.diff, packages);
  const cells = expandWorkflowMatrix(input.matrix, provider);
  const telemetry = input.telemetry ?? [];

  const pkgIndexMap = new Map<string, number>();
  packages.forEach((pkg, idx) => {
    pkgIndexMap.set(pkg.name, idx);
  });

  const hopDistances = new Int32Array(packages.length);
  hopDistances.fill(-1);
  for (const [pkgName, dist] of Object.entries(impact.packageHopDistances)) {
    const idx = pkgIndexMap.get(pkgName);
    if (idx !== undefined) {
      hopDistances[idx] = dist;
    }
  }

  const kernelInputs: KernelCellInput[] = cells.map((cell, idx) => {
    const matched = matchTelemetry(cell, telemetry);
    const minutes = cell.estimatedMinutes ?? matched?.p95DurationMinutes ?? 8;
    const cellWithMin: MatrixCell = { ...cell, estimatedMinutes: minutes, provider: cell.provider ?? provider };
    const costUsd = estimateCellCostUsd(cellWithMin);
    const pkgIdx = cell.targetPackage !== undefined ? (pkgIndexMap.get(cell.targetPackage) ?? -1) : -1;

    return {
      idx,
      id: cell.id,
      os: cell.os,
      arch: cell.arch,
      runtime: cell.runtime ?? 'default',
      suite: cell.suite ?? 'unit',
      pkgIdx,
      required: Boolean(cell.required),
      minutes,
      costUsd,
      hasTelemetry: matched !== undefined,
      totalRuns: matched?.totalRuns ?? 0,
      failures: matched?.failures ?? 0,
      flakeRetriesPassed: matched?.flakeRetriesPassed ?? 0,
      trueRegressions: matched?.trueRegressions ?? -1,
      recentFailureAgeHours: matched?.recentFailureAgeHours ?? -1
    };
  });

  const kernelResult = executePruningKernel(
    impact.changeMode,
    kernelInputs,
    hopDistances,
    packages.length > 0,
    impact.unmappedCodeFiles.length,
    impact.platformSignals,
    input.riskThreshold ?? 0.28,
    input.keepSmokeOnDocsOnly ?? true
  );

  const decisions: EvaluatedCell[] = [];
  const selectedCells: MatrixCell[] = [];
  const skippedCells: MatrixCell[] = [];

  let baselineMinutes = 0;
  let selectedMinutes = 0;
  let baselineCostUsd = 0;
  let selectedCostUsd = 0;

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const kIn = kernelInputs[i];
    const kOut = kernelResult.decisions[i];
    const enrichedCell: MatrixCell = {
      ...cell,
      estimatedMinutes: kIn.minutes,
      provider: cell.provider ?? provider
    };

    baselineMinutes += kIn.minutes;
    baselineCostUsd += kIn.costUsd;

    if (kOut.action === 'RUN') {
      selectedCells.push(enrichedCell);
      selectedMinutes += kIn.minutes;
      selectedCostUsd += kIn.costUsd;
    } else {
      skippedCells.push(enrichedCell);
    }

    decisions.push({
      cell: enrichedCell,
      action: kOut.action,
      reason: kOut.reason,
      riskScore: kOut.riskScore,
      flakeIndex: kOut.flakeIndex,
      wilsonScore: kOut.wilsonScore,
      estimatedMinutes: kIn.minutes,
      estimatedCostUsd: kIn.costUsd
    });
  }

  const savedMinutes = round2(baselineMinutes - selectedMinutes);
  const savedCostUsd = round4(baselineCostUsd - selectedCostUsd);
  const pruneRatio = cells.length > 0 ? round4(skippedCells.length / cells.length) : 0;

  return {
    changeMode: impact.changeMode,
    impact,
    selectedCells,
    skippedCells,
    decisions,
    anchorCellId: kernelResult.anchorIdx >= 0 ? cells[kernelResult.anchorIdx].id : null,
    summary: {
      totalCells: cells.length,
      selectedCount: selectedCells.length,
      skippedCount: skippedCells.length,
      pruneRatio,
      baselineMinutes: round2(baselineMinutes),
      selectedMinutes: round2(selectedMinutes),
      savedMinutes,
      baselineCostUsd: round4(baselineCostUsd),
      selectedCostUsd: round4(selectedCostUsd),
      savedCostUsd
    }
  };
}

function getHeader(headers: Record<string, string | undefined>, target: string): string | undefined {
  const lower = target.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) {
      return v;
    }
  }
  return undefined;
}

function verifyWebhookSignature(rawBody: Buffer, secret: string, signatureHeader: string | undefined): boolean {
  if (!secret || !signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }
  const providedHex = signatureHeader.slice('sha256='.length).trim();
  if (!/^[0-9a-fA-F]{64}$/.test(providedHex)) {
    return false;
  }
  const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex');
  const providedBuf = Buffer.from(providedHex, 'hex');
  const expectedBuf = Buffer.from(expectedHex, 'hex');
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(providedBuf, expectedBuf);
}

export function handleGitHubWebhook(request: WebhookRequest): WebhookResponse {
  const event = getHeader(request.headers, 'x-github-event') ?? 'unknown';
  const deliveryId = getHeader(request.headers, 'x-github-delivery') ?? null;
  const sigHeader = getHeader(request.headers, 'x-hub-signature-256');
  const tsHeader = getHeader(request.headers, 'x-github-timestamp');

  const rawBuf = Buffer.isBuffer(request.rawBody)
    ? request.rawBody
    : Buffer.from(request.rawBody, 'utf8');

  if (!verifyWebhookSignature(rawBuf, request.secret, sigHeader)) {
    return {
      status: 401,
      verified: false,
      event,
      deliveryId,
      error: 'Invalid or missing X-Hub-Signature-256 HMAC signature'
    };
  }

  if (tsHeader !== undefined && request.nowMs !== undefined) {
    const parsedTs = /^\d+$/.test(tsHeader.trim())
      ? Number(tsHeader.trim()) * (tsHeader.trim().length <= 10 ? 1000 : 1)
      : Date.parse(tsHeader);
    const maxSkew = request.maxSkewMs ?? 300_000;
    if (!Number.isFinite(parsedTs) || Math.abs(request.nowMs - parsedTs) > maxSkew) {
      return {
        status: 409,
        verified: true,
        event,
        deliveryId,
        error: 'Webhook timestamp outside allowed replay window'
      };
    }
  }

  if (deliveryId && request.seenDeliveries) {
    if (request.seenDeliveries.has(deliveryId)) {
      return {
        status: 409,
        verified: true,
        event,
        deliveryId,
        error: `Replay detected for delivery ${deliveryId}`
      };
    }
    request.seenDeliveries.add(deliveryId);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBuf.toString('utf8')) as Record<string, unknown>;
  } catch {
    return {
      status: 400,
      verified: true,
      event,
      deliveryId,
      error: 'Malformed JSON webhook payload'
    };
  }

  if (event === 'ping') {
    return {
      status: 202,
      verified: true,
      event,
      deliveryId
    };
  }

  let diffSource: string | string[] = [];
  if (typeof payload.diff === 'string') {
    diffSource = payload.diff;
  } else if (Array.isArray(payload.changed_files)) {
    diffSource = payload.changed_files.map((item) => String(item));
  } else if (Array.isArray(payload.commits)) {
    const touched = new Set<string>();
    for (const c of payload.commits as Array<Record<string, unknown>>) {
      for (const field of ['added', 'modified', 'removed']) {
        const list = c[field];
        if (Array.isArray(list)) {
          for (const f of list) {
            touched.add(String(f));
          }
        }
      }
    }
    diffSource = Array.from(touched);
  }

  const matrixSpec =
    request.workflowMatrix ??
    (payload.matrix as MatrixExecutionPlanInput['matrix'] | undefined);

  const plan =
    matrixSpec !== undefined
      ? planMatrixExecution({
          diff: diffSource,
          packages: request.workspacePackages,
          matrix: matrixSpec,
          telemetry: request.telemetry
        })
      : undefined;

  const runsSource =
    request.inFlightRuns ??
    (Array.isArray(payload.in_flight_runs)
      ? (payload.in_flight_runs as InFlightWorkflowRun[])
      : undefined);

  const zombies = runsSource !== undefined ? detectZombieRuns(runsSource) : undefined;

  return {
    status: 200,
    verified: true,
    event,
    deliveryId,
    plan,
    zombies
  };
}
