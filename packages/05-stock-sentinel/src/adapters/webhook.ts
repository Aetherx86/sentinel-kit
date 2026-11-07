import { createHmac, timingSafeEqual } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import type { SignedWebhookPayload, StockAlertEvent, WebhookDeliveryOptions, WebhookDeliveryResult, WebhookEnvelope } from '../types.ts';

export class AlertDeduplicator {
  private readonly ttlMs: number;
  private readonly seen = new Map<string, number>();

  constructor(ttlMs = 900_000) {
    this.ttlMs = Math.max(1_000, ttlMs);
  }

  private buildKey(alert: StockAlertEvent): string {
    return [
      alert.productId,
      alert.variantId,
      alert.type,
      String(alert.currentAvailable),
      String(alert.currentPriceCents)
    ].join('|');
  }

  prune(nowMs: number): void {
    for (const [key, expiresAt] of this.seen.entries()) {
      if (expiresAt <= nowMs) this.seen.delete(key);
    }
  }

  shouldEmit(alert: StockAlertEvent, nowMs = Date.now()): boolean {
    this.prune(nowMs);
    const key = this.buildKey(alert);
    const existingExpiry = this.seen.get(key);
    if (existingExpiry !== undefined && existingExpiry > nowMs) {
      return false;
    }
    this.seen.set(key, nowMs + this.ttlMs);
    return true;
  }

  size(): number {
    return this.seen.size;
  }
}

export function signWebhookEnvelope(
  envelope: WebhookEnvelope,
  secret: string,
  timestampSec = Math.floor(Date.now() / 1000)
): SignedWebhookPayload {
  const body = JSON.stringify(envelope);
  const signingInput = `${timestampSec}.${body}`;
  const digest = createHmac('sha256', secret).update(signingInput, 'utf8').digest('hex');
  const signature = `sha256=${digest}`;

  return {
    body,
    signature,
    timestampSec,
    headers: {
      'Content-Type': 'application/json',
      'X-Sentinel-Event-Id': envelope.envelopeId,
      'X-Sentinel-Timestamp': String(timestampSec),
      'X-Sentinel-Signature-256': signature
    }
  };
}

export function verifyWebhookSignature(
  rawBody: string,
  secret: string,
  timestampHeader: string,
  signatureHeader: string,
  toleranceSec = 300,
  nowSec = Math.floor(Date.now() / 1000)
): boolean {
  const parsedTs = Number.parseInt(timestampHeader, 10);
  if (!Number.isFinite(parsedTs) || Math.abs(nowSec - parsedTs) > toleranceSec) {
    return false;
  }
  const expected = `sha256=${createHmac('sha256', secret).update(`${parsedTs}.${rawBody}`, 'utf8').digest('hex')}`;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function computeWebhookRetryDelayMs(
  attempt: number,
  baseBackoffMs = 250,
  maxBackoffMs = 30_000,
  retryAfterSeconds: number | null = null
): number {
  const exp = Math.min(10, Math.max(0, attempt - 1));
  const computed = Math.min(maxBackoffMs, baseBackoffMs * Math.pow(2, exp));
  if (retryAfterSeconds !== null && retryAfterSeconds > 0) {
    return Math.min(maxBackoffMs, Math.max(computed, retryAfterSeconds * 1000));
  }
  return computed;
}

function postOnce(
  targetUrl: URL,
  signed: SignedWebhookPayload,
  timeoutMs: number
): Promise<{ statusCode: number; retryAfterSeconds: number | null }> {
  return new Promise((resolve, reject) => {
    const transport = targetUrl.protocol === 'https:' ? httpsRequest : httpRequest;
    const payloadBuf = Buffer.from(signed.body, 'utf8');
    const req = transport(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method: 'POST',
        headers: {
          ...signed.headers,
          'Content-Length': String(payloadBuf.byteLength)
        },
        timeout: timeoutMs
      },
      (res) => {
        res.resume();
        res.on('end', () => {
          const retryHeader = res.headers['retry-after'];
          const rawRetry = Array.isArray(retryHeader) ? retryHeader[0] : retryHeader;
          const parsedRetry = rawRetry !== undefined ? Number.parseInt(rawRetry, 10) : Number.NaN;
          resolve({
            statusCode: res.statusCode ?? 0,
            retryAfterSeconds: Number.isFinite(parsedRetry) ? parsedRetry : null
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Webhook request timed out'));
    });
    req.on('error', (err) => reject(err));
    req.write(payloadBuf);
    req.end();
  });
}

function defaultSleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function deliverWebhookAlert(
  webhookUrl: string,
  envelope: WebhookEnvelope,
  options: WebhookDeliveryOptions
): Promise<WebhookDeliveryResult> {
  const nowMs = options.nowMs ?? Date.now();
  const filteredAlerts = options.deduplicator
    ? envelope.alerts.filter((alert) => options.deduplicator!.shouldEmit(alert, nowMs))
    : envelope.alerts;

  if (filteredAlerts.length === 0) {
    return {
      delivered: true,
      deduplicated: true,
      statusCode: null,
      attempts: 0,
      retryDelaysMs: [],
      signature: '',
      emittedCount: 0
    };
  }

  const outboundEnvelope: WebhookEnvelope = {
    ...envelope,
    alerts: filteredAlerts
  };
  const signed = signWebhookEnvelope(
    outboundEnvelope,
    options.secret,
    options.timestampSec ?? Math.floor(nowMs / 1000)
  );

  const parsedUrl = new URL(webhookUrl);
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const baseBackoffMs = Math.max(10, options.baseBackoffMs ?? 200);
  const maxBackoffMs = Math.max(baseBackoffMs, options.maxBackoffMs ?? 15_000);
  const timeoutMs = Math.max(100, options.timeoutMs ?? 5_000);
  const sleep = options.sleepFn ?? defaultSleep;

  const retryDelaysMs: number[] = [];
  let lastStatus: number | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let retryAfterSeconds: number | null = null;
    try {
      const response = await postOnce(parsedUrl, signed, timeoutMs);
      lastStatus = response.statusCode;
      retryAfterSeconds = response.retryAfterSeconds;

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          delivered: true,
          deduplicated: false,
          statusCode: response.statusCode,
          attempts: attempt,
          retryDelaysMs,
          signature: signed.signature,
          emittedCount: filteredAlerts.length
        };
      }

      const retryable = response.statusCode === 429 || response.statusCode >= 500;
      if (!retryable) {
        return {
          delivered: false,
          deduplicated: false,
          statusCode: response.statusCode,
          attempts: attempt,
          retryDelaysMs,
          signature: signed.signature,
          emittedCount: filteredAlerts.length
        };
      }
    } catch {
      lastStatus = null;
    }

    if (attempt < maxAttempts) {
      const delay = computeWebhookRetryDelayMs(attempt, baseBackoffMs, maxBackoffMs, retryAfterSeconds);
      retryDelaysMs.push(delay);
      await sleep(delay);
    }
  }

  return {
    delivered: false,
    deduplicated: false,
    statusCode: lastStatus,
    attempts: maxAttempts,
    retryDelaysMs,
    signature: signed.signature,
    emittedCount: filteredAlerts.length
  };
}
