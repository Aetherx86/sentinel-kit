export type StorefrontPlatform = 'shopify' | 'woocommerce' | 'nextjs' | 'jsonld' | 'unknown';

export type ChallengeVendor = 'cloudflare' | 'perimeterx' | 'datadome' | 'akamai' | 'generic-waf';

export interface BotChallengeTelemetry {
  challenged: boolean;
  vendor: ChallengeVendor | null;
  statusCode: number;
  challengeScore: number;
  matchedSignals: string[];
  retryAfterSeconds: number | null;
}

export interface VariantSnapshot {
  variantId: string;
  sku: string | null;
  title: string;
  available: boolean;
  inventoryQuantity: number | null;
  lowStockRemaining: number | null;
  /** Canonical 1/100th currency units; scaled by 10^(2 - currency_minor_unit) for minor-unit feeds. */
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
}

export interface CatalogSnapshot {
  sourceUrl: string;
  platform: StorefrontPlatform;
  capturedAtMs: number;
  productId: string;
  handle: string;
  title: string;
  vendor: string | null;
  variants: VariantSnapshot[];
}

export interface ExtractionInput {
  url: string;
  statusCode?: number;
  headers?: Record<string, string | string[] | undefined>;
  body: string;
  capturedAtMs?: number;
  defaultCurrency?: string;
}

export interface ExtractionResult {
  ok: boolean;
  platform: StorefrontPlatform;
  snapshots: CatalogSnapshot[];
  challenge: BotChallengeTelemetry;
  diagnostics: string[];
}

export interface VariantTrackerState {
  variantId: string;
  confirmedAvailable: boolean;
  pendingAvailable: boolean | null;
  pendingStreak: number;
  lastConfirmedPriceCents: number;
  priceHistoryCents: number[];
  restockTimestampsMs: number[];
  lastSeenLowStock: number | null;
  lastUpdatedAtMs: number;
}

export interface EngineState {
  variants: Record<string, VariantTrackerState>;
  lastValidSnapshots: CatalogSnapshot[];
  consecutiveChallenges: number;
  pollTick: number;
}

export type TransitionEventType =
  | 'restock_confirmed'
  | 'out_of_stock_confirmed'
  | 'price_drop'
  | 'price_spike'
  | 'low_stock_warning'
  | 'flap_suppressed'
  | 'challenge_preserved';

export interface StockAlertEvent {
  eventId: string;
  type: TransitionEventType;
  productId: string;
  productTitle: string;
  sourceUrl: string;
  variantId: string;
  sku: string | null;
  variantTitle: string;
  previousAvailable: boolean;
  currentAvailable: boolean;
  previousPriceCents: number;
  currentPriceCents: number;
  priceDeltaBps: number;
  priceZScore: number;
  discountFromCompareAtBps: number;
  restockVelocityPerHour: number;
  severityScore: number;
  detectedAtMs: number;
}

export interface HysteresisConfig {
  restockConfirmTicks?: number;
  outOfStockConfirmTicks?: number;
  minPriceDropBps?: number;
  minPriceSpikeBps?: number;
  anomalyZScoreThreshold?: number;
  priceHistoryWindow?: number;
  velocityWindowMs?: number;
}

export interface TransitionEvaluationResult {
  state: EngineState;
  alerts: StockAlertEvent[];
  suppressedFlaps: StockAlertEvent[];
  preservedPriorState: boolean;
  activeSnapshots: CatalogSnapshot[];
}

export type PollRegime = 'idle' | 'pre_drop' | 'active_drop' | 'confirm_probe' | 'challenge_backoff';

export interface PollScheduleInput {
  baseIntervalMs: number;
  minIntervalMs?: number;
  maxIntervalMs?: number;
  nowMs: number;
  dropWindowStartMs?: number | null;
  dropWindowEndMs?: number | null;
  consecutiveChallenges?: number;
  recentRestockVelocityPerHour?: number;
  pendingConfirmation?: boolean;
  jitterSeed?: number;
}

export interface PollScheduleDecision {
  nextDelayMs: number;
  baseCalculatedMs: number;
  jitterOffsetMs: number;
  minBoundMs: number;
  maxBoundMs: number;
  regime: PollRegime;
}

export interface TierPlanEstimate {
  recommendedTier: 'starter' | 'pro' | 'desk';
  monthlyPriceUsd: number;
  monitoredSkus: number;
  pollIntervalSeconds: number;
  estimatedDailyRequests: number;
  alertChannels: string[];
  withinQuota: boolean;
}

export interface WebhookEnvelope {
  envelopeId: string;
  sentAtIso: string;
  sourceUrl: string;
  alerts: StockAlertEvent[];
}

export interface SignedWebhookHeaders {
  'Content-Type': string;
  'X-Sentinel-Event-Id': string;
  'X-Sentinel-Timestamp': string;
  'X-Sentinel-Signature-256': string;
}

export interface SignedWebhookPayload {
  body: string;
  signature: string;
  timestampSec: number;
  headers: SignedWebhookHeaders;
}

export interface WebhookDeliveryOptions {
  secret: string;
  timestampSec?: number;
  maxAttempts?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
  timeoutMs?: number;
  deduplicator?: {
    shouldEmit(alert: StockAlertEvent, nowMs: number): boolean;
  };
  nowMs?: number;
  sleepFn?: (delayMs: number) => Promise<void>;
}

export interface WebhookDeliveryResult {
  delivered: boolean;
  deduplicated: boolean;
  statusCode: number | null;
  attempts: number;
  retryDelaysMs: number[];
  signature: string;
  emittedCount: number;
}
