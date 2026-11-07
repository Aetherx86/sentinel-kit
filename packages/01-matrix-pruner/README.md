# @bootstrap-suite/matrix-pruner

Deterministic CI/CD test matrix pruner, zombie run detector, and compute savings ledger for GitHub Actions and AWS ephemeral runner fleets.

## Problem Statement

Multi-axis CI workflows (`os x arch x runtime x package x suite`) scale multiplicatively while pull request diffs are typically localized to one workspace module or documentation file. Teams pay per-minute markups—up to 10x on macOS runners and 2x on Windows runners compared to Linux x64—to execute redundant cross-axis cells and superseded commits on open pull requests.

`@bootstrap-suite/matrix-pruner` reduces runner minutes without probabilistic guessing or external API calls. Every pruning decision is reproducible from four inputs: the git diff, the workspace dependency graph, the workflow matrix definition, and historical cell execution counters.

## Architecture

```
packages/01-matrix-pruner/
  src/
    types.ts              Public TypeScript contracts
    core/kernel.ts        Bitset graph propagation, Wilson-score flake dampener, risk VM
    adapters/git-diff.ts  Unified git diff parser and file classifier
    adapters/workflow.ts  GitHub Actions YAML/JSON matrix expander and zombie detector
    adapters/billing.ts   Runner minute rate table and monthly invoice calculator
    index.ts              Library entrypoint and HMAC-verified GitHub webhook handler
    cli.ts                CLI entrypoint (prune, zombies, quote)
```

### Core Pruning Model

1. **Change Classification (`git-diff.ts`)**
   - `config-global`: Root lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `Cargo.lock`), `.github/workflows/*`, and root build configs (`tsconfig.base.json`, `turbo.json`, `nx.json`) trigger `global-invalidate`, running 100% of matrix cells.
   - `docs-only`: Markdown, license/changelog files, and source hunks touching exclusively comment or whitespace lines (`//`, `/* */`, `#`, `--`) prune the matrix down to a single lowest-cost Linux smoke anchor (`DOC_SMOKE_ANCHOR`).
   - `scoped-code`: Maps touched source and test files to workspace packages via longest path prefix match.

2. **Transitive Impact Propagation (`core/kernel.ts`)**
   - Encodes reverse workspace dependencies into 32-bit word bitsets (`Uint32Array`) and propagates reachability waves to compute exact shortest-hop distances (`0` for directly modified packages, `1..k` for transitive dependents, `-1` for isolated packages).
   - Matrix cells bound to unimpacted packages (`hop = -1`) are skipped (`UNIMPACTED_PACKAGE`) unless marked `required: true`.

3. **Wilson-Score Flake Dampening vs. Defect Signal (`core/kernel.ts`)**
   - Naive failure-rate heuristics over-schedule flaky suites because retry noise inflates raw failure counts.
   - Given `totalRuns` ($n$), `failures` ($f$), and `flakeRetriesPassed` ($k$), the kernel isolates non-flake regressions $d = \max(0, f - k)$, computes a smoothed flake index $k / (f + 1.5)$, and evaluates the 95% Wilson score lower bound ($z = 1.96$) on $d / n$.
   - Secondary OS/runtime cells with confirmed defect catches receive a positive risk boost and execute (`HIGH_REGRESSION_RISK`), whereas high-flake cells ($k \approx f$) are dampened and skipped (`FLAKE_DAMPENED_LOW_SIGNAL`).

4. **Primary Linux Anchor Guarantee**
   - On every code change (`scoped-code`), at least one primary Linux cell is guaranteed to execute (`ANCHOR_PRESERVED`) even if a caller configures an aggressive risk threshold.

5. **Superseded & Stalled Run Detection (`workflow.ts`)**
   - Groups active workflow runs by `(workflowName, pullRequestNumber | branch)`. Older in-flight runs on non-protected branches are marked `SUPERSEDED_BY_NEWER_COMMIT` while protected branches (`main`, `master`, `release/*`) continue uninterrupted.
   - Active jobs exceeding `1.5x` historical `p95DurationMinutes` (`P95_RUNTIME_EXCEEDED`) or silent beyond the log inactivity window (`LOG_STALL_TIMEOUT`) are surfaced for immediate cancellation.

## CLI Usage

```bash
# Compute a pruned execution plan from a git diff and GitHub Actions workflow
node src/cli.ts prune \
  --diff ./pr.diff \
  --matrix ./.github/workflows/ci.yml \
  --packages ./workspace-packages.json \
  --telemetry ./telemetry.json \
  --json

# Detect superseded PR runs and stalled jobs
node src/cli.ts zombies --runs ./in-flight-runs.json --json

# Quote monthly invoice comparing 20% compute savings share against flat repo tiers
node src/cli.ts quote --events ./monthly-ledger.json --contributors 25 --json
```

## Programmatic & Webhook Usage

```ts
import {
  planMatrixExecution,
  detectZombieRuns,
  computeSavingsInvoice,
  handleGitHubWebhook
} from '@bootstrap-suite/matrix-pruner';

const plan = planMatrixExecution({
  diff: ['packages/auth/src/session.ts'],
  packages: [
    { name: '@org/auth', path: 'packages/auth' },
    { name: '@org/api', path: 'packages/api', dependencies: ['@org/auth'] },
    { name: '@org/cms', path: 'packages/cms' }
  ],
  matrix: {
    axes: {
      os: ['ubuntu-latest', 'macos-14', 'windows-latest'],
      package: ['@org/auth', '@org/api', '@org/cms']
    }
  }
});
```

`handleGitHubWebhook` validates `X-Hub-Signature-256` with `crypto.timingSafeEqual`, enforces replay deduplication via `X-GitHub-Delivery` and timestamp skew checks via `X-GitHub-Timestamp`, and returns both the pruned matrix plan and zombie cancellation list in a single deterministic pass.

## Commercial Model & Unit Economics

Infrastructure cost to operate `@bootstrap-suite/matrix-pruner` as a hosted GitHub App is near zero: webhook payloads contain file lists and workflow metadata, requiring sub-millisecond CPU time per push with no LLM inference, no container sandboxes, and no source code retention.

### Runner Minute Reference Rates

| Provider | OS | Arch | Baseline vCPU | Rate (USD / min) |
| --- | --- | --- | --- | --- |
| GitHub | Linux | x64 | 2 | $0.008 |
| GitHub | Linux | arm64 | 2 | $0.005 |
| GitHub | Windows | x64 | 2 | $0.016 |
| GitHub | Windows | arm64 | 2 | $0.010 |
| GitHub | macOS | x64 / arm64 | 3 | $0.080 |
| AWS | Linux | x64 | 2 | $0.004 |
| AWS | Linux | arm64 | 2 | $0.003 |
| AWS | Windows | x64 | 2 | $0.010 |
| AWS | macOS | arm64 | 3 | $0.065 |

### Hybrid Pricing Structure

Customers are billed the lesser of **20% of verified gross compute saved** or their **repository contributor flat-tier cap**:

- **Starter** (up to 10 active contributors): 20% savings share, capped at **$49 / month**
- **Growth** (11 to 50 active contributors): 20% savings share, capped at **$149 / month**
- **Scale** (51+ active contributors): 20% savings share, capped at **$299 / month**

If a 30-engineer team saves 15,000 macOS runner minutes ($1,200 gross compute saved) in a month, the uncapped 20% share would be $240, so billing automatically caps at the $149 Growth tier—leaving $1,051 in net monthly CI savings for the customer while yielding >98% gross margin for the service.
