import { computePollScheduleKernel, computeTierPlanKernel, evaluateCatalogTransitionKernel } from './core/kernel.ts';
import { detectBotChallenge, extractStorefrontSnapshot } from './adapters/extractors.ts';
import { AlertDeduplicator, computeWebhookRetryDelayMs, deliverWebhookAlert, signWebhookEnvelope, verifyWebhookSignature } from './adapters/webhook.ts';
import type { BotChallengeTelemetry, CatalogSnapshot, EngineState, ExtractionInput, ExtractionResult, HysteresisConfig, PollScheduleDecision, PollScheduleInput, StockAlertEvent, TierPlanEstimate, TransitionEvaluationResult } from './types.ts';

export type {
  BotChallengeTelemetry,
  CatalogSnapshot,
  ChallengeVendor,
  EngineState,
  ExtractionInput,
  ExtractionResult,
  HysteresisConfig,
  PollRegime,
  PollScheduleDecision,
  PollScheduleInput,
  SignedWebhookHeaders,
  SignedWebhookPayload,
  StockAlertEvent,
  StorefrontPlatform,
  TierPlanEstimate,
  TransitionEvaluationResult,
  TransitionEventType,
  VariantSnapshot,
  VariantTrackerState,
  WebhookDeliveryOptions,
  WebhookDeliveryResult,
  WebhookEnvelope
} from './types.ts';

export {
  AlertDeduplicator,
  computeWebhookRetryDelayMs,
  deliverWebhookAlert,
  detectBotChallenge,
  extractStorefrontSnapshot,
  signWebhookEnvelope,
  verifyWebhookSignature
};

export function evaluateStockTransition(
  prevState: EngineState | null,
  snapshots: CatalogSnapshot[],
  options?: {
    challenge?: BotChallengeTelemetry | null;
    config?: HysteresisConfig;
    evaluatedAtMs?: number;
  }
): TransitionEvaluationResult {
  return evaluateCatalogTransitionKernel(
    prevState,
    snapshots,
    options?.challenge ?? null,
    options?.config ?? {},
    options?.evaluatedAtMs ?? Date.now()
  );
}

export function computeNextPollDelayMs(input: PollScheduleInput): PollScheduleDecision {
  return computePollScheduleKernel(input);
}

export function estimateTierPlan(monitoredSkus: number, pollIntervalSeconds: number): TierPlanEstimate {
  return computeTierPlanKernel(monitoredSkus, pollIntervalSeconds);
}

export interface SentinelTickResult {
  extraction: ExtractionResult;
  transition: TransitionEvaluationResult;
  emittableAlerts: StockAlertEvent[];
  schedule: PollScheduleDecision;
}

export class SentinelEngine {
  private state: EngineState | null = null;
  private readonly config: HysteresisConfig;
  private readonly deduplicator: AlertDeduplicator;
  private readonly baseIntervalMs: number;
  private readonly minIntervalMs: number;
  private readonly maxIntervalMs: number;

  constructor(options?: {
    hysteresis?: HysteresisConfig;
    dedupTtlMs?: number;
    baseIntervalMs?: number;
    minIntervalMs?: number;
    maxIntervalMs?: number;
  }) {
    this.config = options?.hysteresis ?? {};
    this.deduplicator = new AlertDeduplicator(options?.dedupTtlMs ?? 900_000);
    this.baseIntervalMs = options?.baseIntervalMs ?? 30_000;
    this.minIntervalMs = options?.minIntervalMs ?? 1_500;
    this.maxIntervalMs = options?.maxIntervalMs ?? 300_000;
  }

  getState(): EngineState | null {
    return this.state;
  }

  ingestResponse(
    input: ExtractionInput,
    scheduleContext?: {
      dropWindowStartMs?: number | null;
      dropWindowEndMs?: number | null;
      jitterSeed?: number;
    }
  ): SentinelTickResult {
    const nowMs = input.capturedAtMs ?? Date.now();
    const extraction = extractStorefrontSnapshot({ ...input, capturedAtMs: nowMs });
    const transition = evaluateStockTransition(this.state, extraction.snapshots, {
      challenge: extraction.challenge,
      config: this.config,
      evaluatedAtMs: nowMs
    });
    this.state = transition.state;

    const emittableAlerts = transition.alerts.filter((alert) =>
      this.deduplicator.shouldEmit(alert, nowMs)
    );

    const hasPendingConfirmation = Object.values(transition.state.variants).some(
      (v) => v.pendingAvailable !== null && v.pendingStreak > 0
    );
    const maxVelocity = transition.alerts.reduce(
      (acc, item) => Math.max(acc, item.restockVelocityPerHour),
      0
    );

    const schedule = computeNextPollDelayMs({
      baseIntervalMs: this.baseIntervalMs,
      minIntervalMs: this.minIntervalMs,
      maxIntervalMs: this.maxIntervalMs,
      nowMs,
      dropWindowStartMs: scheduleContext?.dropWindowStartMs ?? null,
      dropWindowEndMs: scheduleContext?.dropWindowEndMs ?? null,
      consecutiveChallenges: transition.state.consecutiveChallenges,
      recentRestockVelocityPerHour: maxVelocity,
      pendingConfirmation: hasPendingConfirmation,
      jitterSeed: scheduleContext?.jitterSeed
    });

    return {
      extraction,
      transition,
      emittableAlerts,
      schedule
    };
  }
}
