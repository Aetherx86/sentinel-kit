# @sentinel-kit/stock-sentinel

Deterministic storefront stock and price-drop monitoring engine for Shopify, WooCommerce Store API, Next.js hydration payloads, and Schema.org JSON-LD catalogs. Built on Node.js standard library primitives with zero external runtime dependencies and zero inference API calls.

## Technical Architecture

Most boutique, collectible, hardware, and specialty apparel storefronts expose complete variant-level inventory and pricing inside lightweight JSON endpoints or server-rendered script tags long before a full browser session finishes rendering. `stock-sentinel` bypasses headless Chromium memory overhead by normalizing structured catalog sources directly and feeding them into a stateful hysteresis engine:

1. **Multi-Feed Catalog Normalization (`src/adapters/extractors.ts`)**
   - **Shopify**: Parses `/products.json`, `/products/<handle>.json` decimal strings, and `/products/<handle>.js` Ajax integer-cent payloads into canonical 1/100th currency units (`priceCents`), capturing SKU, `available`, `inventory_quantity`, and `compare_at_price`.
   - **WooCommerce Store API**: Parses `/wp-json/wc/store/v1/products` responses and scales `prices.price` and `prices.regular_price` by `10^(2 - currency_minor_unit)` across 0-decimal, 2-decimal, and 3-decimal currencies, plus `low_stock_remaining` thresholds.
   - **Headless Storefront HTML**: Extracts Next.js `<script id="__NEXT_DATA__" type="application/json">` hydration state trees and `<script type="application/ld+json">` `Product` / `Offer` / `AggregateOffer` `@graph` nodes without DOM emulation.
   - **Anti-Bot Challenge Telemetry**: Scores Cloudflare (`__cf_chl_opt`, `cf-mitigated`), PerimeterX (`_pxCaptcha`), DataDome (`x-datadome`, `captcha-delivery.com`), and Akamai interstitials before catalog parsing so WAF blocks never corrupt prior stock state into false out-of-stock transitions.

2. **Hysteresis & Price Anomaly Kernel (`src/core/kernel.ts`)**
   - **CDN Stale-Cache Flap Suppression**: Edge caches routinely serve stale availability states for single poll ticks during cache invalidation. Configurable confirmation streaks (`restockConfirmTicks`, `outOfStockConfirmTicks`) quarantine single-tick flips as `flap_suppressed` until confirmed across consecutive observations.
   - **Basis-Point & Rolling Z-Score Pricing**: Tracks per-variant price histories to flag markdowns exceeding `minPriceDropBps` or statistical anomalies below `anomalyZScoreThreshold`, alongside compare-at discount basis points and sliding-window restock velocity per hour.
   - **Adaptive Poll Scheduler**: Tightens poll intervals during scheduled drop windows and confirmation probes while applying splitmix32 deterministic jitter to prevent synchronized worker bursts, or exponential backoff when WAF challenge scores spike.

3. **Signed Webhook Delivery (`src/adapters/webhook.ts`)**
   - Signs outbound JSON envelopes with `HMAC-SHA256` (`X-Sentinel-Signature-256: sha256=<hex>` over `<timestamp>.<body>`), verifies signatures in constant time with replay tolerance, deduplicates identical variant transitions over a sliding TTL window, and retries transient `429`/`5xx` responses honoring `Retry-After`.

## Programmatic Usage

```ts
import {
  SentinelEngine,
  deliverWebhookAlert,
  verifyWebhookSignature
} from './src/index.ts';

const engine = new SentinelEngine({
  hysteresis: { restockConfirmTicks: 2, minPriceDropBps: 500 },
  baseIntervalMs: 30_000
});

const tick = engine.ingestResponse(
  {
    url: 'https://store.example/products/field-watch.js',
    statusCode: 200,
    body: rawResponseBody
  },
  {
    dropWindowStartMs: Date.parse('2026-11-04T16:00:00Z'),
    dropWindowEndMs: Date.parse('2026-11-04T16:30:00Z')
  }
);

if (tick.emittableAlerts.length > 0) {
  await deliverWebhookAlert(
    'https://hooks.client.example/stock-alerts',
    {
      envelopeId: `env_${Date.now()}`,
      sentAtIso: new Date().toISOString(),
      sourceUrl: 'https://store.example/products/field-watch.js',
      alerts: tick.emittableAlerts
    },
    { secret: process.env.WEBHOOK_SECRET ?? 'local-dev-secret' }
  );
}
```

## CLI Usage

```bash
# Extract normalized CatalogSnapshot records from a captured feed or HTML document
node --no-warnings src/cli.ts extract --input ./fixtures/products.json --url https://shop.example/products.json

# Diff two snapshots and emit restock and price-drop alert events
node --no-warnings src/cli.ts diff --prev ./prev.json --curr ./curr.json --confirm-ticks 1 --min-drop-bps 500

# Estimate subscription tier and daily poll request volume
node --no-warnings src/cli.ts plan-tier --skus 120 --interval 15
```

## Commercial Packaging & Go-To-Market

### Target Segments
- **E-Commerce Arbitrage & Resell Desks**: Sneaker, watch, GPU, vinyl, and collectible trading groups requiring sub-10-second restock confirmation without false alerts from CDN cache ghosts.
- **Independent Brand & MAP Compliance Analysts**: Merchandising teams tracking competitor markdowns (in basis points) and stock-outs across Shopify and WooCommerce catalogs.

### Subscription Tiers
| Tier | Monthly Price | Monitored SKUs | Min Poll Interval | Alert Channels |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | USD 29 / mo | Up to 50 SKUs | 30s | Signed Webhook, Email |
| **Pro** | USD 79 / mo | Up to 250 SKUs | 10s | Signed Webhook, Email, Discord, Slack |
| **Desk** | USD 249 / mo | Up to 2,000 SKUs | 3s | All Pro channels + PagerDuty + Dedicated Proxy Pool |

### Unit Economics
Direct JSON and hydration-tree parsing processes 1,000 poll evaluations in single-digit milliseconds of CPU with zero headless browser RAM footprint and zero per-call third-party API fees, keeping infrastructure COGS below USD 4/month per Pro seat.
