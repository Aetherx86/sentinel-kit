export type FileChangeKind = 'added' | 'modified' | 'deleted' | 'renamed';

export type FileClassification =
  | 'code'
  | 'test'
  | 'doc'
  | 'comment-only'
  | 'config-global'
  | 'asset';

export type ChangeMode = 'empty' | 'docs-only' | 'global-invalidate' | 'scoped-code';

export interface ParsedDiffFile {
  path: string;
  previousPath?: string;
  kind: FileChangeKind;
  addedLines: string[];
  removedLines: string[];
  classification: FileClassification;
  packageName?: string;
}

export interface WorkspacePackage {
  name: string;
  path: string;
  dependencies?: string[];
  tags?: string[];
}

export interface DiffImpactAnalysis {
  files: ParsedDiffFile[];
  directlyTouchedPackages: string[];
  transitivelyImpactedPackages: string[];
  packageHopDistances: Record<string, number>;
  changeMode: ChangeMode;
  globalTriggers: string[];
  platformSignals: string[];
  unmappedCodeFiles: string[];
}

export type RunnerOS = 'linux' | 'macos' | 'windows';
export type RunnerArch = 'x64' | 'arm64';
export type RunnerProvider = 'github' | 'aws';

export interface MatrixCell {
  id: string;
  os: RunnerOS;
  arch: RunnerArch;
  runtime?: string;
  suite?: string;
  targetPackage?: string;
  provider?: RunnerProvider;
  vcpu?: number;
  estimatedMinutes?: number;
  required?: boolean;
  variables: Record<string, string | number | boolean>;
}

export interface WorkflowMatrixSpec {
  name?: string;
  axes: Record<string, Array<string | number | boolean>>;
  include?: Array<Record<string, string | number | boolean>>;
  exclude?: Array<Record<string, string | number | boolean>>;
  defaultEstimatedMinutes?: number;
  provider?: RunnerProvider;
}

export interface CellTelemetry {
  cellId?: string;
  suite?: string;
  targetPackage?: string;
  totalRuns: number;
  failures: number;
  flakeRetriesPassed: number;
  trueRegressions?: number;
  p95DurationMinutes?: number;
  recentFailureAgeHours?: number;
}

export type CellDecisionAction = 'RUN' | 'SKIP';

export type CellDecisionReason =
  | 'GLOBAL_CONFIG_TOUCH'
  | 'DIRECT_PACKAGE_IMPACT'
  | 'TRANSITIVE_PACKAGE_IMPACT'
  | 'HIGH_REGRESSION_RISK'
  | 'ANCHOR_PRESERVED'
  | 'DOC_SMOKE_ANCHOR'
  | 'PINNED_REQUIRED'
  | 'UNIMPACTED_PACKAGE'
  | 'REDUNDANT_CROSS_AXIS'
  | 'FLAKE_DAMPENED_LOW_SIGNAL'
  | 'DOC_ONLY_PRUNED';

export interface EvaluatedCell {
  cell: MatrixCell;
  action: CellDecisionAction;
  reason: CellDecisionReason;
  riskScore: number;
  flakeIndex: number;
  wilsonScore: number;
  estimatedMinutes: number;
  estimatedCostUsd: number;
}

export interface MatrixPlanSummary {
  totalCells: number;
  selectedCount: number;
  skippedCount: number;
  pruneRatio: number;
  baselineMinutes: number;
  selectedMinutes: number;
  savedMinutes: number;
  baselineCostUsd: number;
  selectedCostUsd: number;
  savedCostUsd: number;
}

export interface MatrixExecutionPlanInput {
  diff: string | string[];
  packages?: WorkspacePackage[];
  matrix: MatrixCell[] | WorkflowMatrixSpec | string;
  telemetry?: CellTelemetry[];
  riskThreshold?: number;
  keepSmokeOnDocsOnly?: boolean;
  defaultProvider?: RunnerProvider;
}

export interface MatrixExecutionPlan {
  changeMode: ChangeMode;
  impact: DiffImpactAnalysis;
  selectedCells: MatrixCell[];
  skippedCells: MatrixCell[];
  decisions: EvaluatedCell[];
  anchorCellId: string | null;
  summary: MatrixPlanSummary;
}

export interface InFlightJob {
  jobId: string;
  name: string;
  elapsedMinutes: number;
  p95DurationMinutes?: number;
  lastLogOutputAgoMinutes?: number;
}

export interface InFlightWorkflowRun {
  runId: string;
  workflowName: string;
  branch: string;
  pullRequestNumber?: number;
  commitSha: string;
  startedAtIso: string;
  elapsedMinutes?: number;
  p95DurationMinutes?: number;
  remainingEstimatedMinutes?: number;
  isProtectedBranch?: boolean;
  jobs?: InFlightJob[];
}

export interface ZombieDetectionOptions {
  p95Multiplier?: number;
  stallThresholdMinutes?: number;
  cancelProtectedBranches?: boolean;
}

export type ZombieReason =
  | 'SUPERSEDED_BY_NEWER_COMMIT'
  | 'P95_RUNTIME_EXCEEDED'
  | 'LOG_STALL_TIMEOUT';

export interface ZombieCancellationAction {
  runId: string;
  jobId?: string;
  reason: ZombieReason;
  supersededByRunId?: string;
  wastedMinutesAvoided: number;
}

export interface ZombieDetectionResult {
  cancelActions: ZombieCancellationAction[];
  activeHeadRuns: string[];
  totalWastedMinutesAvoided: number;
}

export type RepoTier = 'starter' | 'growth' | 'scale';
export type PricingModel = 'savings-share' | 'flat-tier' | 'best-for-customer';

export interface LedgerEvent {
  eventId?: string;
  timestampIso?: string;
  provider: RunnerProvider;
  os: RunnerOS;
  arch: RunnerArch;
  vcpu?: number;
  savedMinutes: number;
  executedMinutes?: number;
}

export interface SavingsInvoiceInput {
  month: string;
  activeContributors?: number;
  repoSizeTier?: RepoTier;
  events: LedgerEvent[];
  pricingModel?: PricingModel;
}

export interface OsCostBreakdown {
  savedMinutes: number;
  executedMinutes: number;
  savedCostUsd: number;
}

export interface SavingsInvoice {
  month: string;
  tier: RepoTier;
  flatTierFeeUsd: number;
  grossBaselineCostUsd: number;
  grossExecutedCostUsd: number;
  grossComputeSavedUsd: number;
  savingsShareRate: number;
  savingsShareFeeUsd: number;
  netCustomerSavingsOnShareUsd: number;
  netCustomerSavingsOnFlatUsd: number;
  effectiveFeeUsd: number;
  billingModeApplied: 'savings-share' | 'flat-tier';
  breakdownByOs: Record<RunnerOS, OsCostBreakdown>;
}

export interface WebhookRequest {
  headers: Record<string, string | undefined>;
  rawBody: string | Buffer;
  secret: string;
  nowMs?: number;
  maxSkewMs?: number;
  seenDeliveries?: Set<string>;
  workspacePackages?: WorkspacePackage[];
  workflowMatrix?: MatrixCell[] | WorkflowMatrixSpec | string;
  telemetry?: CellTelemetry[];
  inFlightRuns?: InFlightWorkflowRun[];
}

export interface WebhookResponse {
  status: 200 | 202 | 400 | 401 | 409;
  verified: boolean;
  event: string;
  deliveryId: string | null;
  error?: string;
  plan?: MatrixExecutionPlan;
  zombies?: ZombieDetectionResult;
}

export interface CliIO {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  cwd?: string;
}
