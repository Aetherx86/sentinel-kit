import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  analyzeDiffImpact,
  computeSavingsInvoice,
  detectZombieRuns,
  expandWorkflowMatrix,
  getRunnerMinuteRateUsd,
  handleGitHubWebhook,
  planMatrixExecution
} from '../src/index.ts';
import { runCli } from '../src/cli.ts';
import type {
  CellTelemetry,
  InFlightWorkflowRun,
  LedgerEvent,
  MatrixCell,
  WorkspacePackage
} from '../src/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../src/cli.ts');

const MONOREPO_PACKAGES: WorkspacePackage[] = [
  { name: '@acme/core-crypto', path: 'packages/core-crypto', dependencies: [] },
  { name: '@acme/auth', path: 'packages/auth', dependencies: ['@acme/core-crypto'] },
  { name: '@acme/api', path: 'packages/api', dependencies: ['@acme/auth'] },
  { name: '@acme/billing', path: 'packages/billing', dependencies: [] },
  { name: '@acme/reporting', path: 'packages/reporting', dependencies: ['@acme/billing'] }
];

function createMonorepoMatrix(): MatrixCell[] {
  const cells: MatrixCell[] = [];
  for (const pkg of MONOREPO_PACKAGES) {
    const slug = pkg.name.replace('@acme/', '');
    cells.push(
      {
        id: `${slug}-linux-x64-unit`,
        os: 'linux',
        arch: 'x64',
        runtime: '22',
        suite: 'unit',
        targetPackage: pkg.name,
        estimatedMinutes: 6,
        variables: { os: 'ubuntu-latest', node: 22, package: pkg.name }
      },
      {
        id: `${slug}-macos-arm64-unit`,
        os: 'macos',
        arch: 'arm64',
        runtime: '22',
        suite: 'unit',
        targetPackage: pkg.name,
        estimatedMinutes: 8,
        variables: { os: 'macos-14', node: 22, package: pkg.name }
      },
      {
        id: `${slug}-windows-x64-unit`,
        os: 'windows',
        arch: 'x64',
        runtime: '22',
        suite: 'unit',
        targetPackage: pkg.name,
        estimatedMinutes: 10,
        variables: { os: 'windows-latest', node: 22, package: pkg.name }
      }
    );
  }
  return cells;
}

describe('01-matrix-pruner', () => {
  it('propagates transitive monorepo dependency impact and prunes unimpacted packages', () => {
    const diff = [
      'diff --git a/packages/core-crypto/src/hmac.ts b/packages/core-crypto/src/hmac.ts',
      'index 1111111..2222222 100644',
      '--- a/packages/core-crypto/src/hmac.ts',
      '+++ b/packages/core-crypto/src/hmac.ts',
      '@@ -10,3 +10,4 @@',
      '+export const KEY_VERSION = 2;'
    ].join('\n');

    const plan = planMatrixExecution({
      diff,
      packages: MONOREPO_PACKAGES,
      matrix: createMonorepoMatrix()
    });

    assert.equal(plan.changeMode, 'scoped-code');
    assert.deepEqual(plan.impact.directlyTouchedPackages, ['@acme/core-crypto']);
    assert.deepEqual(plan.impact.transitivelyImpactedPackages, [
      '@acme/core-crypto',
      '@acme/auth',
      '@acme/api'
    ]);
    assert.equal(plan.impact.packageHopDistances['@acme/core-crypto'], 0);
    assert.equal(plan.impact.packageHopDistances['@acme/auth'], 1);
    assert.equal(plan.impact.packageHopDistances['@acme/api'], 2);

    const selectedIds = plan.selectedCells.map((c) => c.id);
    assert.deepEqual(selectedIds, [
      'core-crypto-linux-x64-unit',
      'auth-linux-x64-unit',
      'api-linux-x64-unit'
    ]);

    const billingDecision = plan.decisions.find((d) => d.cell.id === 'billing-linux-x64-unit');
    assert.ok(billingDecision);
    assert.equal(billingDecision.action, 'SKIP');
    assert.equal(billingDecision.reason, 'UNIMPACTED_PACKAGE');
    assert.ok(plan.summary.savedCostUsd > 0);
  });

  it('prunes documentation-only diffs down to a single minimal Linux smoke anchor', () => {
    const diff = [
      'diff --git a/README.md b/README.md',
      '--- a/README.md',
      '+++ b/README.md',
      '@@ -1,2 +1,3 @@',
      '+# Updated installation guide',
      'diff --git a/docs/runbook.md b/docs/runbook.md',
      '--- a/docs/runbook.md',
      '+++ b/docs/runbook.md',
      '@@ -4,1 +4,2 @@',
      '+Verify deployment variables.'
    ].join('\n');

    const matrix: MatrixCell[] = [
      {
        id: 'macos-arm64-e2e',
        os: 'macos',
        arch: 'arm64',
        suite: 'e2e',
        estimatedMinutes: 20,
        variables: {}
      },
      {
        id: 'linux-x64-smoke',
        os: 'linux',
        arch: 'x64',
        suite: 'smoke',
        estimatedMinutes: 2,
        variables: {}
      },
      {
        id: 'windows-x64-integration',
        os: 'windows',
        arch: 'x64',
        suite: 'integration',
        estimatedMinutes: 14,
        variables: {}
      },
      {
        id: 'linux-x64-integration',
        os: 'linux',
        arch: 'x64',
        suite: 'integration',
        estimatedMinutes: 12,
        variables: {}
      }
    ];

    const plan = planMatrixExecution({ diff, matrix });
    assert.equal(plan.changeMode, 'docs-only');
    assert.equal(plan.selectedCells.length, 1);
    assert.equal(plan.selectedCells[0].id, 'linux-x64-smoke');
    assert.equal(plan.anchorCellId, 'linux-x64-smoke');

    const anchorDecision = plan.decisions.find((d) => d.cell.id === 'linux-x64-smoke');
    assert.equal(anchorDecision?.reason, 'DOC_SMOKE_ANCHOR');

    const macDecision = plan.decisions.find((d) => d.cell.id === 'macos-arm64-e2e');
    assert.equal(macDecision?.action, 'SKIP');
    assert.equal(macDecision?.reason, 'DOC_ONLY_PRUNED');
  });

  it('classifies comment-only TypeScript diffs as non-executable and prunes expensive cells', () => {
    const commentDiff = [
      'diff --git a/packages/auth/src/token.ts b/packages/auth/src/token.ts',
      '--- a/packages/auth/src/token.ts',
      '+++ b/packages/auth/src/token.ts',
      '@@ -1,4 +1,6 @@',
      '-// Old token note',
      '+// Clarify token TTL invariant for clock skew tolerance',
      '+/* Internal note only */'
    ].join('\n');

    const impact = analyzeDiffImpact(commentDiff, MONOREPO_PACKAGES);
    assert.equal(impact.files[0].classification, 'comment-only');
    assert.equal(impact.changeMode, 'docs-only');

    const plan = planMatrixExecution({
      diff: commentDiff,
      packages: MONOREPO_PACKAGES,
      matrix: createMonorepoMatrix()
    });
    assert.equal(plan.summary.selectedCount, 1);
    assert.equal(plan.summary.skippedCount, 14);
  });

  it('forces full matrix execution when lockfile or CI workflow file is touched', () => {
    const lockfilePlan = planMatrixExecution({
      diff: ['packages/auth/src/index.ts', 'pnpm-lock.yaml'],
      packages: MONOREPO_PACKAGES,
      matrix: createMonorepoMatrix()
    });

    assert.equal(lockfilePlan.changeMode, 'global-invalidate');
    assert.deepEqual(lockfilePlan.impact.globalTriggers, ['pnpm-lock.yaml']);
    assert.equal(lockfilePlan.summary.selectedCount, 15);
    assert.equal(lockfilePlan.summary.skippedCount, 0);
    assert.ok(lockfilePlan.decisions.every((d) => d.reason === 'GLOBAL_CONFIG_TOUCH'));

    const workflowPlan = planMatrixExecution({
      diff: ['.github/workflows/ci.yml'],
      packages: MONOREPO_PACKAGES,
      matrix: createMonorepoMatrix()
    });
    assert.equal(workflowPlan.changeMode, 'global-invalidate');
    assert.equal(workflowPlan.summary.selectedCount, 15);
  });

  it('distinguishes true regression risk from high-flake retry noise via Wilson dampening', () => {
    const matrix: MatrixCell[] = [
      {
        id: 'linux-x64-unit',
        os: 'linux',
        arch: 'x64',
        runtime: '22',
        suite: 'unit',
        estimatedMinutes: 5,
        variables: {}
      },
      {
        id: 'macos-flaky-e2e',
        os: 'macos',
        arch: 'arm64',
        runtime: '22',
        suite: 'e2e',
        estimatedMinutes: 20,
        variables: {}
      },
      {
        id: 'windows-regression-catcher',
        os: 'windows',
        arch: 'x64',
        runtime: '22',
        suite: 'integration',
        estimatedMinutes: 12,
        variables: {}
      }
    ];

    const telemetry: CellTelemetry[] = [
      {
        cellId: 'macos-flaky-e2e',
        totalRuns: 100,
        failures: 38,
        flakeRetriesPassed: 37,
        recentFailureAgeHours: 4
      },
      {
        cellId: 'windows-regression-catcher',
        totalRuns: 100,
        failures: 18,
        flakeRetriesPassed: 1,
        recentFailureAgeHours: 12
      }
    ];

    const plan = planMatrixExecution({
      diff: ['src/storage/file-lock.ts'],
      matrix,
      telemetry
    });

    const flaky = plan.decisions.find((d) => d.cell.id === 'macos-flaky-e2e')!;
    const catcher = plan.decisions.find((d) => d.cell.id === 'windows-regression-catcher')!;

    assert.equal(flaky.action, 'SKIP');
    assert.equal(flaky.reason, 'FLAKE_DAMPENED_LOW_SIGNAL');
    assert.ok(flaky.flakeIndex > 0.9);
    assert.ok(flaky.wilsonScore < 0.01);

    assert.equal(catcher.action, 'RUN');
    assert.equal(catcher.reason, 'HIGH_REGRESSION_RISK');
    assert.ok(catcher.wilsonScore > 0.1);
    assert.ok(catcher.riskScore > flaky.riskScore);
  });

  it('preserves at least one primary Linux anchor cell on code changes even under strict threshold', () => {
    const matrix: MatrixCell[] = [
      {
        id: 'macos-arm64-unit',
        os: 'macos',
        arch: 'arm64',
        runtime: '22',
        suite: 'unit',
        estimatedMinutes: 9,
        variables: {}
      },
      {
        id: 'linux-x64-unit',
        os: 'linux',
        arch: 'x64',
        runtime: '22',
        suite: 'unit',
        estimatedMinutes: 5,
        variables: {}
      },
      {
        id: 'windows-x64-unit',
        os: 'windows',
        arch: 'x64',
        runtime: '22',
        suite: 'unit',
        estimatedMinutes: 11,
        variables: {}
      }
    ];

    const plan = planMatrixExecution({
      diff: ['src/math/stat.ts'],
      matrix,
      riskThreshold: 0.95
    });

    assert.equal(plan.selectedCells.length, 1);
    assert.equal(plan.selectedCells[0].id, 'linux-x64-unit');
    assert.equal(plan.anchorCellId, 'linux-x64-unit');
    const decision = plan.decisions.find((d) => d.cell.id === 'linux-x64-unit')!;
    assert.equal(decision.reason, 'ANCHOR_PRESERVED');
  });

  it('activates OS-specific matrix cells when platform-specific files are modified', () => {
    const matrix: MatrixCell[] = [
      { id: 'linux-unit', os: 'linux', arch: 'x64', runtime: '22', suite: 'unit', variables: {} },
      { id: 'macos-unit', os: 'macos', arch: 'arm64', runtime: '22', suite: 'unit', variables: {} },
      { id: 'win-unit', os: 'windows', arch: 'x64', runtime: '22', suite: 'unit', variables: {} }
    ];

    const plan = planMatrixExecution({
      diff: ['scripts/bootstrap.ps1', 'src/os/win32/registry.ts'],
      matrix
    });

    const selected = plan.selectedCells.map((c) => c.id);
    assert.ok(selected.includes('linux-unit'));
    assert.ok(selected.includes('win-unit'));
    assert.ok(!selected.includes('macos-unit'));
  });

  it('parses GitHub Actions YAML strategy.matrix with Cartesian axes, include, and exclude', () => {
    const yaml = `
name: CI Suite
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-14, windows-latest]
        node: [20, 22]
        exclude:
          - os: macos-14
            node: 20
          - os: windows-latest
            node: 20
        include:
          - os: ubuntu-latest
            node: 22
            suite: integration
            estimatedMinutes: 14
          - os: ubuntu-24.04-arm
            node: 24
            suite: smoke
            estimatedMinutes: 3
`;

    const expanded = expandWorkflowMatrix(yaml);
    // 3 * 2 = 6 base - 2 excluded = 4, one augmented in-place (ubuntu-latest + 22), one standalone arm64 added = 5
    assert.equal(expanded.length, 5);

    const armCell = expanded.find((c) => c.runtime === '24');
    assert.ok(armCell);
    assert.equal(armCell.os, 'linux');
    assert.equal(armCell.arch, 'arm64');
    assert.equal(armCell.suite, 'smoke');

    const macCell = expanded.find((c) => c.os === 'macos');
    assert.ok(macCell);
    assert.equal(macCell.arch, 'arm64');
    assert.equal(macCell.runtime, '22');

    const augmentedUbuntu = expanded.find(
      (c) => c.os === 'linux' && c.arch === 'x64' && c.runtime === '22'
    );
    assert.equal(augmentedUbuntu?.suite, 'integration');
    assert.equal(augmentedUbuntu?.estimatedMinutes, 14);
  });

  it('detects superseded PR workflow runs, p95 runtime overruns, and stalled log zombies while sparing main', () => {
    const runs: InFlightWorkflowRun[] = [
      {
        runId: 'run-pr-old-1',
        workflowName: 'ci',
        branch: 'feat/oauth',
        pullRequestNumber: 42,
        commitSha: 'aaaa111',
        startedAtIso: '2026-11-04T02:00:00Z',
        elapsedMinutes: 4,
        p95DurationMinutes: 16
      },
      {
        runId: 'run-pr-old-2',
        workflowName: 'ci',
        branch: 'feat/oauth',
        pullRequestNumber: 42,
        commitSha: 'bbbb222',
        startedAtIso: '2026-11-04T02:03:00Z',
        elapsedMinutes: 2,
        p95DurationMinutes: 16
      },
      {
        runId: 'run-pr-head',
        workflowName: 'ci',
        branch: 'feat/oauth',
        pullRequestNumber: 42,
        commitSha: 'cccc333',
        startedAtIso: '2026-11-04T02:05:00Z',
        elapsedMinutes: 1,
        p95DurationMinutes: 16
      },
      {
        runId: 'run-main-1',
        workflowName: 'ci',
        branch: 'main',
        commitSha: '1111fff',
        startedAtIso: '2026-11-04T02:00:00Z',
        elapsedMinutes: 5,
        p95DurationMinutes: 15
      },
      {
        runId: 'run-main-2',
        workflowName: 'ci',
        branch: 'main',
        commitSha: '2222fff',
        startedAtIso: '2026-11-04T02:04:00Z',
        elapsedMinutes: 2,
        p95DurationMinutes: 15
      },
      {
        runId: 'run-hung',
        workflowName: 'nightly-e2e',
        branch: 'feat/search',
        pullRequestNumber: 55,
        commitSha: 'dddd444',
        startedAtIso: '2026-11-04T01:00:00Z',
        jobs: [
          {
            jobId: 'job-stalled',
            name: 'playwright-webkit',
            elapsedMinutes: 22,
            p95DurationMinutes: 20,
            lastLogOutputAgoMinutes: 18
          },
          {
            jobId: 'job-over-p95',
            name: 'db-soak',
            elapsedMinutes: 35,
            p95DurationMinutes: 20,
            lastLogOutputAgoMinutes: 1
          }
        ]
      }
    ];

    const result = detectZombieRuns(runs);

    assert.ok(result.activeHeadRuns.includes('run-pr-head'));
    assert.ok(result.activeHeadRuns.includes('run-main-1'));
    assert.ok(result.activeHeadRuns.includes('run-main-2'));

    const superseded = result.cancelActions.filter(
      (a) => a.reason === 'SUPERSEDED_BY_NEWER_COMMIT'
    );
    assert.equal(superseded.length, 2);
    assert.ok(superseded.every((s) => s.supersededByRunId === 'run-pr-head'));

    const stalled = result.cancelActions.find((a) => a.jobId === 'job-stalled');
    assert.equal(stalled?.reason, 'LOG_STALL_TIMEOUT');

    const overP95 = result.cancelActions.find((a) => a.jobId === 'job-over-p95');
    assert.equal(overP95?.reason, 'P95_RUNTIME_EXCEEDED');
    assert.ok(result.totalWastedMinutesAvoided >= 40);
  });

  it('verifies GitHub webhook HMAC-SHA256 signatures and rejects tampering or replays', () => {
    const secret = 'whsec_test_998877665544332211';
    const bodyObj = {
      changed_files: ['packages/auth/src/login.ts'],
      in_flight_runs: [
        {
          runId: 'r-1',
          workflowName: 'ci',
          branch: 'feat/login',
          pullRequestNumber: 12,
          commitSha: 'abc1',
          startedAtIso: '2026-11-04T03:00:00Z'
        },
        {
          runId: 'r-2',
          workflowName: 'ci',
          branch: 'feat/login',
          pullRequestNumber: 12,
          commitSha: 'abc2',
          startedAtIso: '2026-11-04T03:02:00Z'
        }
      ]
    };
    const rawBody = JSON.stringify(bodyObj);
    const validSig = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const seenDeliveries = new Set<string>();
    const nowMs = Date.parse('2026-11-04T03:02:10Z');

    const okRes = handleGitHubWebhook({
      headers: {
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'deliv-001',
        'X-Hub-Signature-256': validSig,
        'X-GitHub-Timestamp': String(Math.floor(nowMs / 1000))
      },
      rawBody,
      secret,
      nowMs,
      seenDeliveries,
      workspacePackages: MONOREPO_PACKAGES,
      workflowMatrix: createMonorepoMatrix()
    });

    assert.equal(okRes.status, 200);
    assert.equal(okRes.verified, true);
    assert.equal(okRes.plan?.selectedCells.length, 2); // auth + api
    assert.equal(okRes.zombies?.cancelActions.length, 1);
    assert.equal(okRes.zombies?.cancelActions[0].runId, 'r-1');

    // Replay same delivery ID -> 409
    const replayRes = handleGitHubWebhook({
      headers: {
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'deliv-001',
        'X-Hub-Signature-256': validSig
      },
      rawBody,
      secret,
      seenDeliveries
    });
    assert.equal(replayRes.status, 409);

    // Stale timestamp outside 5-minute replay window -> 409
    const staleRes = handleGitHubWebhook({
      headers: {
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'deliv-002',
        'X-Hub-Signature-256': validSig,
        'X-GitHub-Timestamp': String(Math.floor((nowMs - 900_000) / 1000))
      },
      rawBody,
      secret,
      nowMs,
      seenDeliveries
    });
    assert.equal(staleRes.status, 409);

    // Tampered payload with original signature -> 401
    const badSigRes = handleGitHubWebhook({
      headers: {
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': 'deliv-003',
        'X-Hub-Signature-256': validSig
      },
      rawBody: `${rawBody} `,
      secret,
      seenDeliveries
    });
    assert.equal(badSigRes.status, 401);
    assert.equal(badSigRes.verified, false);
  });

  it('computes accurate runner minute rates and 20% savings-share vs flat-tier invoices', () => {
    assert.equal(getRunnerMinuteRateUsd('github', 'linux', 'x64', 2), 0.008);
    assert.equal(getRunnerMinuteRateUsd('github', 'linux', 'x64', 8), 0.032);
    assert.equal(getRunnerMinuteRateUsd('github', 'macos', 'arm64'), 0.08);
    assert.equal(getRunnerMinuteRateUsd('aws', 'linux', 'arm64'), 0.003);

    const smallEvents: LedgerEvent[] = [
      { provider: 'github', os: 'linux', arch: 'x64', savedMinutes: 2000, executedMinutes: 500 },
      { provider: 'github', os: 'macos', arch: 'arm64', savedMinutes: 1000, executedMinutes: 200 }
    ];
    // Saved: 2000 * 0.008 ($16) + 1000 * 0.08 ($80) = $96.00 -> 20% share = $19.20 (< $49 starter cap)
    const starterInvoice = computeSavingsInvoice({
      month: '2026-11',
      activeContributors: 8,
      events: smallEvents
    });
    assert.equal(starterInvoice.tier, 'starter');
    assert.equal(starterInvoice.flatTierFeeUsd, 49);
    assert.equal(starterInvoice.grossComputeSavedUsd, 96);
    assert.equal(starterInvoice.savingsShareFeeUsd, 19.2);
    assert.equal(starterInvoice.billingModeApplied, 'savings-share');
    assert.equal(starterInvoice.effectiveFeeUsd, 19.2);

    // High-volume growth repo: saved 15,000 macOS mins = $1,200 -> 20% share = $240 > $149 growth flat cap
    const growthInvoice = computeSavingsInvoice({
      month: '2026-11',
      activeContributors: 28,
      events: [{ provider: 'github', os: 'macos', arch: 'arm64', savedMinutes: 15000 }]
    });
    assert.equal(growthInvoice.tier, 'growth');
    assert.equal(growthInvoice.flatTierFeeUsd, 149);
    assert.equal(growthInvoice.savingsShareFeeUsd, 240);
    assert.equal(growthInvoice.billingModeApplied, 'flat-tier');
    assert.equal(growthInvoice.effectiveFeeUsd, 149);
    assert.equal(growthInvoice.netCustomerSavingsOnFlatUsd, 1051);

    // Scale repo (> 50 contributors) -> $299 flat tier
    const scaleInvoice = computeSavingsInvoice({
      month: '2026-11',
      activeContributors: 120,
      pricingModel: 'flat-tier',
      events: smallEvents
    });
    assert.equal(scaleInvoice.tier, 'scale');
    assert.equal(scaleInvoice.flatTierFeeUsd, 299);
    assert.equal(scaleInvoice.effectiveFeeUsd, 299);
  });

  it('executes prune, zombies, and quote subcommands via runCli and direct CLI subprocess', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'matrix-pruner-cli-'));
    try {
      const diffFile = path.join(tmpDir, 'pr.diff');
      const matrixFile = path.join(tmpDir, 'ci.yml');
      const runsFile = path.join(tmpDir, 'runs.json');
      const eventsFile = path.join(tmpDir, 'events.json');

      fs.writeFileSync(diffFile, 'README.md\n', 'utf8');
      fs.writeFileSync(
        matrixFile,
        [
          'jobs:',
          '  test:',
          '    strategy:',
          '      matrix:',
          '        os: [ubuntu-latest, macos-14]',
          '        suite: [smoke, e2e]'
        ].join('\n'),
        'utf8'
      );
      fs.writeFileSync(
        runsFile,
        JSON.stringify([
          {
            runId: 'r-old',
            workflowName: 'ci',
            branch: 'feat/cli',
            pullRequestNumber: 7,
            commitSha: '111',
            startedAtIso: '2026-11-04T01:00:00Z'
          },
          {
            runId: 'r-new',
            workflowName: 'ci',
            branch: 'feat/cli',
            pullRequestNumber: 7,
            commitSha: '222',
            startedAtIso: '2026-11-04T01:05:00Z'
          }
        ]),
        'utf8'
      );
      fs.writeFileSync(
        eventsFile,
        JSON.stringify([
          { provider: 'github', os: 'windows', arch: 'x64', savedMinutes: 1000 }
        ]),
        'utf8'
      );

      let outBuf = '';
      const codePrune = runCli(['prune', '--diff', diffFile, '--matrix', matrixFile, '--json'], {
        stdout: (s) => {
          outBuf += s;
        },
        stderr: () => {}
      });
      assert.equal(codePrune, 0);
      const parsedPrune = JSON.parse(outBuf);
      assert.equal(parsedPrune.changeMode, 'docs-only');
      assert.equal(parsedPrune.summary.selectedCount, 1);

      outBuf = '';
      const codeZombies = runCli(['zombies', '--runs', runsFile, '--json'], {
        stdout: (s) => {
          outBuf += s;
        },
        stderr: () => {}
      });
      assert.equal(codeZombies, 0);
      const parsedZombies = JSON.parse(outBuf);
      assert.equal(parsedZombies.cancelActions.length, 1);

      const subprocessOut = execFileSync(
        process.execPath,
        ['--no-warnings', CLI_PATH, 'quote', '--events', eventsFile, '--contributors', '6', '--json'],
        { encoding: 'utf8' }
      );
      const parsedQuote = JSON.parse(subprocessOut);
      assert.equal(parsedQuote.grossComputeSavedUsd, 16);
      assert.equal(parsedQuote.savingsShareFeeUsd, 3.2);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('honors required pinned cells on empty diffs and supports disabling doc smoke anchor', () => {
    const matrix: MatrixCell[] = [
      {
        id: 'compliance-audit',
        os: 'linux',
        arch: 'x64',
        suite: 'lint',
        required: true,
        estimatedMinutes: 2,
        variables: {}
      },
      {
        id: 'macos-unit',
        os: 'macos',
        arch: 'arm64',
        suite: 'unit',
        estimatedMinutes: 8,
        variables: {}
      }
    ];

    const emptyPlan = planMatrixExecution({ diff: [], matrix });
    assert.equal(emptyPlan.changeMode, 'empty');
    assert.deepEqual(emptyPlan.selectedCells.map((c) => c.id), ['compliance-audit']);
    assert.equal(emptyPlan.decisions[0].reason, 'PINNED_REQUIRED');

    const noSmokePlan = planMatrixExecution({
      diff: ['CHANGELOG.md'],
      matrix: [matrix[1]],
      keepSmokeOnDocsOnly: false
    });
    assert.equal(noSmokePlan.changeMode, 'docs-only');
    assert.equal(noSmokePlan.selectedCells.length, 0);
  });

  it('retains primary Linux coverage when unmapped root code files change in a monorepo', () => {
    const plan = planMatrixExecution({
      diff: ['scripts/verify-release-artifacts.ts'],
      packages: MONOREPO_PACKAGES,
      matrix: createMonorepoMatrix()
    });

    assert.equal(plan.changeMode, 'scoped-code');
    assert.deepEqual(plan.impact.unmappedCodeFiles, ['scripts/verify-release-artifacts.ts']);
    assert.ok(plan.selectedCells.length >= 1);
    assert.ok(plan.selectedCells.every((c) => c.os === 'linux'));
  });
});
