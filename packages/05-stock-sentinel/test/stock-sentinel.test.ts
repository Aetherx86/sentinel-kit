import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runCli } from '../src/cli.ts';
import {
  AlertDeduplicator,
  SentinelEngine,
  computeNextPollDelayMs,
  deliverWebhookAlert,
  detectBotChallenge,
  estimateTierPlan,
  evaluateStockTransition,
  extractStorefrontSnapshot,
  signWebhookEnvelope,
  verifyWebhookSignature
} from '../src/index.ts';
import type { WebhookEnvelope } from '../src/types.ts';

describe('05-stock-sentinel', () => {
  it('normalizes Shopify /products.json decimal strings and /products/<handle>.js cent integers', () => {
    const productsJson = JSON.stringify({
      products: [
        {
          id: 88101,
          title: 'Titanium Field Watch',
          handle: 'titanium-field-watch',
          vendor: 'ChronoWorks',
          variants: [
            {
              id: 401,
              title: '38mm Matte',
              sku: 'CW-38-MAT',
              available: false,
              inventory_quantity: 0,
              price: '299.00',
              compare_at_price: '349.00'
            },
            {
              id: 402,
              title: '40mm Brushed',
              sku: 'CW-40-BRU',
              available: true,
              inventory_quantity: 4,
              price: '319.95',
              compare_at_price: null
            }
          ]
        }
      ]
    });

    const jsonRes = extractStorefrontSnapshot({
      url: 'https://chronoworks.example/products.json',
      body: productsJson,
      capturedAtMs: 1_700_000_000_000
    });

    assert.equal(jsonRes.ok, true);
    assert.equal(jsonRes.platform, 'shopify');
    assert.equal(jsonRes.snapshots.length, 1);
    assert.equal(jsonRes.snapshots[0].variants[0].priceCents, 29900);
    assert.equal(jsonRes.snapshots[0].variants[0].compareAtPriceCents, 34900);
    assert.equal(jsonRes.snapshots[0].variants[0].available, false);
    assert.equal(jsonRes.snapshots[0].variants[1].priceCents, 31995);
    assert.equal(jsonRes.snapshots[0].variants[1].lowStockRemaining, 4);

    const ajaxJsPayload = JSON.stringify({
      id: 88101,
      title: 'Titanium Field Watch',
      handle: 'titanium-field-watch',
      price: 24900,
      variants: [
        {
          id: 401,
          title: '38mm Matte',
          sku: 'CW-38-MAT',
          available: true,
          price: 24900,
          compare_at_price: 29900
        }
      ]
    });

    const jsRes = extractStorefrontSnapshot({
      url: 'https://chronoworks.example/products/titanium-field-watch.js',
      body: ajaxJsPayload,
      capturedAtMs: 1_700_000_030_000
    });

    assert.equal(jsRes.ok, true);
    assert.equal(jsRes.platform, 'shopify');
    assert.equal(jsRes.snapshots[0].variants[0].priceCents, 24900);
    assert.equal(jsRes.snapshots[0].variants[0].compareAtPriceCents, 29900);
    assert.equal(jsRes.snapshots[0].variants[0].available, true);
  });

  it('normalizes WooCommerce Store API minor-unit currencies across 0, 2, and 3 decimals', () => {
    const wooPayload = JSON.stringify([
      {
        id: 501,
        name: 'Espresso Grinder Burr Set',
        slug: 'espresso-burr-set',
        sku: 'BURR-64MM',
        is_in_stock: true,
        is_purchasable: true,
        low_stock_remaining: 3,
        prices: {
          price: '18500',
          regular_price: '22000',
          currency_code: 'USD',
          currency_minor_unit: 2
        }
      },
      {
        id: 502,
        name: 'Kuwait Edition Tamper',
        slug: 'kuwait-tamper',
        sku: 'TMP-KWD',
        is_in_stock: true,
        prices: {
          price: '25750',
          regular_price: '30000',
          currency_code: 'KWD',
          currency_minor_unit: 3
        }
      },
      {
        id: 503,
        name: 'Tokyo Pour-Over Kettle',
        slug: 'tokyo-kettle',
        sku: 'KTL-JPY',
        is_in_stock: false,
        prices: {
          price: '12800',
          regular_price: '12800',
          currency_code: 'JPY',
          currency_minor_unit: 0
        }
      }
    ]);

    const res = extractStorefrontSnapshot({
      url: 'https://roaster.example/wp-json/wc/store/v1/products',
      body: wooPayload,
      capturedAtMs: 1_700_000_000_000
    });

    assert.equal(res.ok, true);
    assert.equal(res.platform, 'woocommerce');
    assert.equal(res.snapshots.length, 3);

    assert.equal(res.snapshots[0].variants[0].priceCents, 18500);
    assert.equal(res.snapshots[0].variants[0].compareAtPriceCents, 22000);
    assert.equal(res.snapshots[0].variants[0].lowStockRemaining, 3);

    assert.equal(res.snapshots[1].variants[0].priceCents, 2575);
    assert.equal(res.snapshots[1].variants[0].compareAtPriceCents, 3000);
    assert.equal(res.snapshots[1].variants[0].currency, 'KWD');

    assert.equal(res.snapshots[2].variants[0].priceCents, 1280000);
    assert.equal(res.snapshots[2].variants[0].available, false);
    assert.equal(res.snapshots[2].variants[0].compareAtPriceCents, null);
  });

  it('extracts Next.js __NEXT_DATA__ hydration state and enriches vendor from JSON-LD', () => {
    const html = `<!doctype html>
<html>
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Carbon Trail Shoe",
      "brand": { "@type": "Brand", "name": "ApexStride" },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "210.00",
        "availability": "https://schema.org/InStock"
      }
    }
  </script>
</head>
<body>
  <div id="__next"></div>
  <script id="__NEXT_DATA__" type="application/json">
    {
      "props": {
        "pageProps": {
          "dehydratedCatalog": {
            "product": {
              "id": "shoe-990",
              "slug": "carbon-trail-shoe",
              "title": "Carbon Trail Shoe",
              "currency": "USD",
              "variants": [
                { "id": "sz-10", "sku": "CTS-10", "title": "US 10", "price": "210.00", "compareAtPrice": "250.00", "available": true, "inventoryQuantity": 7 },
                { "id": "sz-11", "sku": "CTS-11", "title": "US 11", "price": "210.00", "available": false, "inventoryQuantity": 0 }
              ]
            }
          }
        }
      }
    }
  </script>
</body>
</html>`;

    const res = extractStorefrontSnapshot({
      url: 'https://apexstride.example/products/carbon-trail-shoe',
      body: html
    });

    assert.equal(res.ok, true);
    assert.equal(res.platform, 'nextjs');
    assert.equal(res.snapshots.length, 1);
    assert.equal(res.snapshots[0].vendor, 'ApexStride');
    assert.equal(res.snapshots[0].variants.length, 2);
    assert.equal(res.snapshots[0].variants[0].sku, 'CTS-10');
    assert.equal(res.snapshots[0].variants[0].priceCents, 21000);
    assert.equal(res.snapshots[0].variants[0].compareAtPriceCents, 25000);
    assert.equal(res.snapshots[0].variants[1].available, false);
  });

  it('extracts schema.org @graph AggregateOffer JSON-LD when hydration state is absent', () => {
    const html = `<!doctype html>
<html>
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "name": "AudioLab" },
        {
          "@type": "Product",
          "productID": "planar-hd1",
          "name": "Planar Reference Headphones",
          "brand": "AudioLab",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "offers": [
              { "@type": "Offer", "sku": "PHD1-BLK", "name": "Anodized Black", "price": "699.00", "availability": "https://schema.org/OutOfStock" },
              { "@type": "Offer", "sku": "PHD1-SLV", "name": "Raw Silver", "price": "649.00", "highPrice": "699.00", "availability": "https://schema.org/LimitedAvailability" }
            ]
          }
        }
      ]
    }
  </script>
</head>
<body><h1>Planar Reference Headphones</h1></body>
</html>`;

    const res = extractStorefrontSnapshot({
      url: 'https://audiolab.example/planar-hd1',
      body: html
    });

    assert.equal(res.ok, true);
    assert.equal(res.platform, 'jsonld');
    assert.equal(res.snapshots[0].variants.length, 2);
    assert.equal(res.snapshots[0].variants[0].available, false);
    assert.equal(res.snapshots[0].variants[1].available, true);
    assert.equal(res.snapshots[0].variants[1].priceCents, 64900);
    assert.equal(res.snapshots[0].variants[1].compareAtPriceCents, 69900);
  });

  it('suppresses single-tick CDN stale-cache flaps via hysteresis and fires on confirmed restock', () => {
    const makeSnap = (available: boolean) => [
      {
        sourceUrl: 'https://drop.example/item',
        platform: 'shopify' as const,
        capturedAtMs: 1_700_000_000_000,
        productId: 'gpu-5090',
        handle: 'gpu-5090',
        title: 'Founders Compute Card',
        vendor: 'SiliconCorp',
        variants: [
          {
            variantId: 'v-1',
            sku: 'GPU-FE-01',
            title: 'Standard',
            available,
            inventoryQuantity: available ? 2 : 0,
            lowStockRemaining: available ? 2 : null,
            priceCents: 199900,
            compareAtPriceCents: null,
            currency: 'USD'
          }
        ]
      }
    ];

    const t0 = 1_700_000_000_000;
    const s0 = evaluateStockTransition(null, makeSnap(false), {
      config: { restockConfirmTicks: 2 },
      evaluatedAtMs: t0
    });
    assert.equal(s0.alerts.length, 0);

    // Tick 1: stale CDN edge briefly reports available=true
    const s1 = evaluateStockTransition(s0.state, makeSnap(true), {
      config: { restockConfirmTicks: 2 },
      evaluatedAtMs: t0 + 5_000
    });
    assert.equal(s1.alerts.length, 0);
    assert.equal(s1.suppressedFlaps.length, 1);
    assert.equal(s1.suppressedFlaps[0].type, 'flap_suppressed');
    assert.equal(s1.state.variants['gpu-5090::v-1'].confirmedAvailable, false);

    // Tick 2: origin responds available=false again -> flap cleared with zero false alerts
    const s2 = evaluateStockTransition(s1.state, makeSnap(false), {
      config: { restockConfirmTicks: 2 },
      evaluatedAtMs: t0 + 10_000
    });
    assert.equal(s2.alerts.length, 0);
    assert.equal(s2.state.variants['gpu-5090::v-1'].pendingStreak, 0);

    // Tick 3 + Tick 4: two consecutive in-stock reads confirm genuine restock
    const s3 = evaluateStockTransition(s2.state, makeSnap(true), {
      config: { restockConfirmTicks: 2 },
      evaluatedAtMs: t0 + 15_000
    });
    assert.equal(s3.alerts.length, 0);

    const s4 = evaluateStockTransition(s3.state, makeSnap(true), {
      config: { restockConfirmTicks: 2 },
      evaluatedAtMs: t0 + 20_000
    });
    const restocks = s4.alerts.filter((a) => a.type === 'restock_confirmed');
    assert.equal(restocks.length, 1);
    assert.equal(restocks[0].currentAvailable, true);
    assert.equal(s4.state.variants['gpu-5090::v-1'].confirmedAvailable, true);
  });

  it('computes price-drop basis points and negative z-score anomalies accurately', () => {
    const snapAt = (priceCents: number, compareAtPriceCents: number | null = 25000) => [
      {
        sourceUrl: 'https://gear.example/jacket',
        platform: 'shopify' as const,
        capturedAtMs: 1_700_000_000_000,
        productId: 'jkt-1',
        handle: 'alpine-shell',
        title: 'Alpine Shell',
        vendor: 'NorthPeak',
        variants: [
          {
            variantId: 'med',
            sku: 'ALP-M',
            title: 'Medium',
            available: true,
            inventoryQuantity: 12,
            lowStockRemaining: null,
            priceCents,
            compareAtPriceCents,
            currency: 'USD'
          }
        ]
      }
    ];

    let state = evaluateStockTransition(null, snapAt(20000), { evaluatedAtMs: 1_000 }).state;
    state = evaluateStockTransition(state, snapAt(20100), { evaluatedAtMs: 2_000 }).state;
    state = evaluateStockTransition(state, snapAt(19900), { evaluatedAtMs: 3_000 }).state;
    state = evaluateStockTransition(state, snapAt(20000), { evaluatedAtMs: 4_000 }).state;

    // 20% price drop: 20000 -> 16000 (-2000 bps)
    const dropped = evaluateStockTransition(state, snapAt(16000), {
      config: { minPriceDropBps: 500, anomalyZScoreThreshold: -2.0 },
      evaluatedAtMs: 5_000
    });

    assert.equal(dropped.alerts.length, 1);
    assert.equal(dropped.alerts[0].type, 'price_drop');
    assert.equal(dropped.alerts[0].priceDeltaBps, -2000);
    assert.equal(dropped.alerts[0].discountFromCompareAtBps, 3600);
    assert.ok(dropped.alerts[0].priceZScore < -10);
  });

  it('detects Cloudflare, PerimeterX, and DataDome bot challenges and preserves prior state', () => {
    const cfTelemetry = detectBotChallenge(
      403,
      { 'cf-mitigated': 'challenge', server: 'cloudflare', 'retry-after': '45' },
      '<html><title>Attention Required! | Cloudflare</title><script>window.__cf_chl_opt={};</script></html>'
    );
    assert.equal(cfTelemetry.challenged, true);
    assert.equal(cfTelemetry.vendor, 'cloudflare');
    assert.equal(cfTelemetry.retryAfterSeconds, 45);

    const ddTelemetry = detectBotChallenge(
      403,
      { 'x-datadome': 'protected' },
      '<html><script src="https://geo.captcha-delivery.com/captcha/"></script></html>'
    );
    assert.equal(ddTelemetry.challenged, true);
    assert.equal(ddTelemetry.vendor, 'datadome');

    const pxTelemetry = detectBotChallenge(
      403,
      {},
      '<html><div id="px-captcha"></div><script>window._pxCaptcha = {};</script></html>'
    );
    assert.equal(pxTelemetry.challenged, true);
    assert.equal(pxTelemetry.vendor, 'perimeterx');

    const engine = new SentinelEngine({ hysteresis: { restockConfirmTicks: 2, outOfStockConfirmTicks: 1 } });
    const validTick = engine.ingestResponse({
      url: 'https://sneaker.example/products/retro.js',
      statusCode: 200,
      body: JSON.stringify({
        id: 77,
        title: 'Retro Low',
        handle: 'retro-low',
        price: 13000,
        variants: [{ id: 1, title: 'US 9', sku: 'RL-9', available: true, price: 13000 }]
      }),
      capturedAtMs: 10_000
    });
    assert.equal(validTick.extraction.ok, true);
    assert.equal(validTick.transition.state.variants['77::1'].confirmedAvailable, true);

    // Subsequent 503 Cloudflare interstitial must NOT flip item to out-of-stock
    const challengedTick = engine.ingestResponse({
      url: 'https://sneaker.example/products/retro.js',
      statusCode: 503,
      headers: { server: 'cloudflare', 'cf-ray': '88abc123-SJC' },
      body: '<html><head><title>Just a moment...</title></head><body>cdn-cgi/challenge-platform</body></html>',
      capturedAtMs: 20_000
    });

    assert.equal(challengedTick.extraction.ok, false);
    assert.equal(challengedTick.transition.preservedPriorState, true);
    assert.equal(challengedTick.emittableAlerts.length, 0);
    assert.equal(challengedTick.transition.state.variants['77::1'].confirmedAvailable, true);
    assert.equal(challengedTick.schedule.regime, 'challenge_backoff');
  });

  it('tightens adaptive poll schedule during drop windows and enforces deterministic jitter bounds', () => {
    const dropStart = 1_700_000_600_000;
    const dropEnd = 1_700_001_200_000;

    const idle = computeNextPollDelayMs({
      baseIntervalMs: 30_000,
      minIntervalMs: 2_000,
      maxIntervalMs: 180_000,
      nowMs: dropStart - 3_600_000,
      dropWindowStartMs: dropStart,
      dropWindowEndMs: dropEnd,
      jitterSeed: 0x1234abcd
    });
    assert.equal(idle.regime, 'idle');
    assert.ok(idle.nextDelayMs >= idle.minBoundMs && idle.nextDelayMs <= idle.maxBoundMs);

    const preDrop = computeNextPollDelayMs({
      baseIntervalMs: 30_000,
      minIntervalMs: 2_000,
      maxIntervalMs: 180_000,
      nowMs: dropStart - 300_000,
      dropWindowStartMs: dropStart,
      dropWindowEndMs: dropEnd,
      jitterSeed: 0x1234abcd
    });
    assert.equal(preDrop.regime, 'pre_drop');
    assert.ok(preDrop.baseCalculatedMs < idle.baseCalculatedMs);

    const activeDrop = computeNextPollDelayMs({
      baseIntervalMs: 30_000,
      minIntervalMs: 2_000,
      maxIntervalMs: 180_000,
      nowMs: dropStart + 15_000,
      dropWindowStartMs: dropStart,
      dropWindowEndMs: dropEnd,
      jitterSeed: 0x1234abcd
    });
    const activeDropRepeat = computeNextPollDelayMs({
      baseIntervalMs: 30_000,
      minIntervalMs: 2_000,
      maxIntervalMs: 180_000,
      nowMs: dropStart + 15_000,
      dropWindowStartMs: dropStart,
      dropWindowEndMs: dropEnd,
      jitterSeed: 0x1234abcd
    });

    assert.equal(activeDrop.regime, 'active_drop');
    assert.equal(activeDrop.nextDelayMs, activeDropRepeat.nextDelayMs);
    assert.ok(activeDrop.baseCalculatedMs < preDrop.baseCalculatedMs);
    assert.ok(activeDrop.nextDelayMs >= activeDrop.minBoundMs && activeDrop.nextDelayMs <= activeDrop.maxBoundMs);
  });

  it('tracks restock velocity per hour across repeated drops in sliding window', () => {
    const snap = (available: boolean) => [
      {
        sourceUrl: 'https://console.example/drop',
        platform: 'shopify' as const,
        capturedAtMs: 0,
        productId: 'con-1',
        handle: 'pro-console',
        title: 'Pro Console',
        vendor: 'PlayTech',
        variants: [
          {
            variantId: 'std',
            sku: 'PC-01',
            title: 'Disc Edition',
            available,
            inventoryQuantity: available ? 5 : 0,
            lowStockRemaining: null,
            priceCents: 49900,
            compareAtPriceCents: null,
            currency: 'USD'
          }
        ]
      }
    ];

    const cfg = { restockConfirmTicks: 1, outOfStockConfirmTicks: 1, velocityWindowMs: 3_600_000 };
    let st = evaluateStockTransition(null, snap(false), { config: cfg, evaluatedAtMs: 100_000 }).state;
    let res = evaluateStockTransition(st, snap(true), { config: cfg, evaluatedAtMs: 200_000 });
    assert.equal(res.alerts[0].restockVelocityPerHour, 1);

    st = evaluateStockTransition(res.state, snap(false), { config: cfg, evaluatedAtMs: 300_000 }).state;
    res = evaluateStockTransition(st, snap(true), { config: cfg, evaluatedAtMs: 400_000 });
    assert.equal(res.alerts[0].restockVelocityPerHour, 2);
  });

  it('signs webhook envelopes with HMAC-SHA256 and rejects tampered payloads or stale timestamps', () => {
    const envelope: WebhookEnvelope = {
      envelopeId: 'env_01',
      sentAtIso: '2026-11-04T00:00:00.000Z',
      sourceUrl: 'https://store.example/item',
      alerts: []
    };
    const secret = 'whsec_test_key_998877';
    const ts = 1_700_000_100;
    const signed = signWebhookEnvelope(envelope, secret, ts);

    assert.match(signed.headers['X-Sentinel-Signature-256'], /^sha256=[0-9a-f]{64}$/);
    assert.equal(
      verifyWebhookSignature(signed.body, secret, signed.headers['X-Sentinel-Timestamp'], signed.signature, 300, ts + 60),
      true
    );
    assert.equal(
      verifyWebhookSignature(signed.body + ' ', secret, signed.headers['X-Sentinel-Timestamp'], signed.signature, 300, ts + 60),
      false
    );
    assert.equal(
      verifyWebhookSignature(signed.body, secret, signed.headers['X-Sentinel-Timestamp'], signed.signature, 300, ts + 900),
      false
    );
  });

  it('delivers signed webhooks over local node:http with 503 retry recovery and idempotent deduplication', async () => {
    const receivedRequests: Array<{ body: string; sig: string; ts: string }> = [];
    let callCount = 0;

    const server = createServer((req, res) => {
      callCount += 1;
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        receivedRequests.push({
          body: Buffer.concat(chunks).toString('utf8'),
          sig: String(req.headers['x-sentinel-signature-256'] ?? ''),
          ts: String(req.headers['x-sentinel-timestamp'] ?? '')
        });
        if (callCount === 1) {
          res.writeHead(503, { 'Retry-After': '1' });
          res.end('temporary upstream saturation');
          return;
        }
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end('{"accepted":true}');
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address();
    const port = typeof addr === 'object' && addr ? addr.port : 0;
    const endpoint = `http://127.0.0.1:${port}/hooks/stock`;

    try {
      const deduplicator = new AlertDeduplicator(600_000);
      const secret = 'whsec_live_local_secret';
      const envelope: WebhookEnvelope = {
        envelopeId: 'env_live_101',
        sentAtIso: '2026-11-04T04:00:00.000Z',
        sourceUrl: 'https://chronoworks.example/products.json',
        alerts: [
          {
            eventId: 'evt_a1b2c3d4',
            type: 'restock_confirmed',
            productId: '88101',
            productTitle: 'Titanium Field Watch',
            sourceUrl: 'https://chronoworks.example/products.json',
            variantId: '401',
            sku: 'CW-38-MAT',
            variantTitle: '38mm Matte',
            previousAvailable: false,
            currentAvailable: true,
            previousPriceCents: 29900,
            currentPriceCents: 24900,
            priceDeltaBps: -1672,
            priceZScore: -3.2,
            discountFromCompareAtBps: 2865,
            restockVelocityPerHour: 1,
            severityScore: 88,
            detectedAtMs: 1_700_000_200_000
          }
        ]
      };

      const sleptDelays: number[] = [];
      const firstDelivery = await deliverWebhookAlert(endpoint, envelope, {
        secret,
        timestampSec: 1_700_000_200,
        nowMs: 1_700_000_200_000,
        maxAttempts: 3,
        baseBackoffMs: 100,
        deduplicator,
        sleepFn: async (ms) => {
          sleptDelays.push(ms);
        }
      });

      assert.equal(firstDelivery.delivered, true);
      assert.equal(firstDelivery.deduplicated, false);
      assert.equal(firstDelivery.attempts, 2);
      assert.equal(firstDelivery.statusCode, 202);
      assert.deepEqual(sleptDelays, [1000]);
      assert.equal(receivedRequests.length, 2);
      assert.equal(
        verifyWebhookSignature(
          receivedRequests[1].body,
          secret,
          receivedRequests[1].ts,
          receivedRequests[1].sig,
          300,
          1_700_000_205
        ),
        true
      );

      // Duplicate delivery within TTL window is suppressed without hitting network
      const duplicateDelivery = await deliverWebhookAlert(endpoint, envelope, {
        secret,
        timestampSec: 1_700_000_210,
        nowMs: 1_700_000_210_000,
        deduplicator
      });
      assert.equal(duplicateDelivery.delivered, true);
      assert.equal(duplicateDelivery.deduplicated, true);
      assert.equal(duplicateDelivery.attempts, 0);
      assert.equal(receivedRequests.length, 2);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('executes CLI extract, diff, and plan-tier subcommands cleanly', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'sentinel-cli-'));
    try {
      const prevFile = join(tempDir, 'prev.json');
      const currFile = join(tempDir, 'curr.json');

      writeFileSync(
        prevFile,
        JSON.stringify({
          products: [
            {
              id: 901,
              title: 'Limited Mechanical Keyboard',
              handle: 'mech-kbd',
              variants: [{ id: 11, title: '65% Brass', sku: 'KBD-65', available: false, price: '320.00' }]
            }
          ]
        }),
        'utf8'
      );

      writeFileSync(
        currFile,
        JSON.stringify({
          products: [
            {
              id: 901,
              title: 'Limited Mechanical Keyboard',
              handle: 'mech-kbd',
              variants: [{ id: 11, title: '65% Brass', sku: 'KBD-65', available: true, price: '272.00' }]
            }
          ]
        }),
        'utf8'
      );

      let outBuf = '';
      const extractCode = await runCli(['extract', '--input', currFile, '--url', 'https://kbd.example/products.json'], {
        stdout: (s) => { outBuf += s; },
        stderr: () => {}
      });
      assert.equal(extractCode, 0);
      const parsedExtract = JSON.parse(outBuf) as { platform: string; snapshots: Array<{ variants: Array<{ priceCents: number }> }> };
      assert.equal(parsedExtract.platform, 'shopify');
      assert.equal(parsedExtract.snapshots[0].variants[0].priceCents, 27200);

      outBuf = '';
      const diffCode = await runCli(['diff', '--prev', prevFile, '--curr', currFile, '--confirm-ticks', '1'], {
        stdout: (s) => { outBuf += s; },
        stderr: () => {}
      });
      assert.equal(diffCode, 0);
      const parsedDiff = JSON.parse(outBuf) as { alerts: Array<{ type: string; priceDeltaBps: number }> };
      const types = parsedDiff.alerts.map((a) => a.type).sort();
      assert.deepEqual(types, ['price_drop', 'restock_confirmed']);

      const cliPath = fileURLToPath(new URL('../src/cli.ts', import.meta.url));
      const tierStdout = execFileSync(
        process.execPath,
        ['--no-warnings', cliPath, 'plan-tier', '--skus', '120', '--interval', '15'],
        { encoding: 'utf8' }
      );
      const tierPlan = JSON.parse(tierStdout) as ReturnType<typeof estimateTierPlan>;
      assert.equal(tierPlan.recommendedTier, 'pro');
      assert.equal(tierPlan.monthlyPriceUsd, 79);
      assert.equal(tierPlan.withinQuota, true);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('emits low_stock_warning when remaining inventory crosses <= 5 threshold', () => {
    const snapWithStock = (low: number) => [
      {
        sourceUrl: 'https://gear.example/lens',
        platform: 'woocommerce' as const,
        capturedAtMs: 0,
        productId: 'lens-35',
        handle: 'prime-35mm',
        title: 'Prime 35mm f/1.4',
        vendor: 'OpticCo',
        variants: [
          {
            variantId: 'lens-35',
            sku: 'OPT-35',
            title: 'Default',
            available: true,
            inventoryQuantity: low,
            lowStockRemaining: low,
            priceCents: 89900,
            compareAtPriceCents: null,
            currency: 'USD'
          }
        ]
      }
    ];

    const s0 = evaluateStockTransition(null, snapWithStock(9), { evaluatedAtMs: 1_000 });
    assert.equal(s0.alerts.length, 0);

    const s1 = evaluateStockTransition(s0.state, snapWithStock(4), { evaluatedAtMs: 2_000 });
    assert.equal(s1.alerts.length, 1);
    assert.equal(s1.alerts[0].type, 'low_stock_warning');

    // Subsequent tick still <= 5 does not re-fire low_stock_warning continuously
    const s2 = evaluateStockTransition(s1.state, snapWithStock(3), { evaluatedAtMs: 3_000 });
    assert.equal(s2.alerts.length, 0);
  });

  it('requires outOfStockConfirmTicks before emitting out_of_stock_confirmed', () => {
    const snap = (available: boolean) => [
      {
        sourceUrl: 'https://shop.example/bag',
        platform: 'shopify' as const,
        capturedAtMs: 0,
        productId: 'bag-1',
        handle: 'duffel-bag',
        title: 'Waxed Duffel',
        vendor: 'CanvasCo',
        variants: [
          {
            variantId: 'olive',
            sku: 'DFL-OLV',
            title: 'Olive',
            available,
            inventoryQuantity: available ? 3 : 0,
            lowStockRemaining: null,
            priceCents: 24000,
            compareAtPriceCents: null,
            currency: 'USD'
          }
        ]
      }
    ];

    const s0 = evaluateStockTransition(null, snap(true), {
      config: { outOfStockConfirmTicks: 2 },
      evaluatedAtMs: 10_000
    });
    const s1 = evaluateStockTransition(s0.state, snap(false), {
      config: { outOfStockConfirmTicks: 2 },
      evaluatedAtMs: 20_000
    });
    assert.equal(s1.alerts.length, 0);
    assert.equal(s1.suppressedFlaps.length, 1);

    const s2 = evaluateStockTransition(s1.state, snap(false), {
      config: { outOfStockConfirmTicks: 2 },
      evaluatedAtMs: 30_000
    });
    assert.equal(s2.alerts.length, 1);
    assert.equal(s2.alerts[0].type, 'out_of_stock_confirmed');
    assert.equal(s2.alerts[0].currentAvailable, false);
  });
});
