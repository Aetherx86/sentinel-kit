import { scoreBotChallengeKernel } from '../core/kernel.ts';
import type { BotChallengeTelemetry, CatalogSnapshot, ExtractionInput, ExtractionResult, StorefrontPlatform, VariantSnapshot } from '../types.ts';

function normalizeHeaders(
  headers?: Record<string, string | string[] | undefined>
): Array<[string, string]> {
  if (!headers) return [];
  const pairs: Array<[string, string]> = [];
  for (const [key, raw] of Object.entries(headers)) {
    if (raw === undefined) continue;
    if (Array.isArray(raw)) {
      for (const item of raw) pairs.push([key, item]);
    } else {
      pairs.push([key, raw]);
    }
  }
  return pairs;
}

export function detectBotChallenge(
  statusCode: number,
  headers: Record<string, string | string[] | undefined> | undefined,
  body: string
): BotChallengeTelemetry {
  return scoreBotChallengeKernel(statusCode, normalizeHeaders(headers), body);
}

function parseDecimalToCents(raw: string | number | null | undefined, integerMeansCents: boolean): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null;
    if (Number.isInteger(raw)) {
      return integerMeansCents ? raw : raw * 100;
    }
    return Math.round(raw * 100);
  }
  const trimmed = String(raw).trim().replace(/^[^0-9.-]+/, '').replace(/,/g, '');
  if (!trimmed || !/^-?\d+(?:\.\d+)?$/.test(trimmed)) return null;
  if (!trimmed.includes('.')) {
    const val = Number.parseInt(trimmed, 10);
    return integerMeansCents ? val : val * 100;
  }
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [wholePart, fracPart = ''] = unsigned.split('.');
  const paddedFrac = (fracPart + '00').slice(0, 2);
  const extraDigit = fracPart.length >= 3 ? Number.parseInt(fracPart[2], 10) : 0;
  let cents = Number.parseInt(wholePart, 10) * 100 + Number.parseInt(paddedFrac, 10);
  if (extraDigit >= 5) cents += 1;
  return negative ? -cents : cents;
}

function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseShopifyProduct(
  raw: Record<string, unknown>,
  sourceUrl: string,
  capturedAtMs: number,
  defaultCurrency: string,
  isAjaxJs: boolean
): CatalogSnapshot | null {
  const rawVariants = Array.isArray(raw.variants) ? raw.variants : [];
  if (rawVariants.length === 0) return null;

  const productId = String(raw.id ?? raw.handle ?? 'shopify-product');
  const title = String(raw.title ?? productId);
  const handle = typeof raw.handle === 'string' && raw.handle.length > 0 ? raw.handle : slugifyHandle(title);
  const vendor = typeof raw.vendor === 'string' && raw.vendor.length > 0 ? raw.vendor : null;
  const currency = typeof raw.currency === 'string' && raw.currency.length > 0 ? raw.currency.toUpperCase() : defaultCurrency;

  const variants: VariantSnapshot[] = [];
  for (const item of rawVariants) {
    if (!isRecord(item)) continue;
    const priceCents = parseDecimalToCents(item.price as string | number | null | undefined, isAjaxJs);
    if (priceCents === null) continue;
    const compareCents = parseDecimalToCents(
      item.compare_at_price as string | number | null | undefined,
      isAjaxJs
    );
    const invQty = typeof item.inventory_quantity === 'number' ? item.inventory_quantity : null;
    const explicitAvail = typeof item.available === 'boolean'
      ? item.available
      : invQty !== null
        ? invQty > 0
        : true;

    variants.push({
      variantId: String(item.id ?? `${productId}-${variants.length + 1}`),
      sku: typeof item.sku === 'string' && item.sku.length > 0 ? item.sku : null,
      title: typeof item.title === 'string' && item.title.length > 0 ? item.title : 'Default Title',
      available: explicitAvail,
      inventoryQuantity: invQty,
      lowStockRemaining: invQty !== null && invQty > 0 && invQty <= 10 ? invQty : null,
      priceCents,
      compareAtPriceCents: compareCents !== null && compareCents > priceCents ? compareCents : null,
      currency
    });
  }

  if (variants.length === 0) return null;
  return {
    sourceUrl,
    platform: 'shopify',
    capturedAtMs,
    productId,
    handle,
    title,
    vendor,
    variants
  };
}

function isWooStoreProduct(raw: Record<string, unknown>): boolean {
  return isRecord(raw.prices) && ('is_in_stock' in raw || 'currency_minor_unit' in raw.prices);
}

function scaleMinorUnitToCents(rawAmount: unknown, minorUnit: number): number | null {
  if (rawAmount === null || rawAmount === undefined || rawAmount === '') return null;
  const numeric = typeof rawAmount === 'number' ? rawAmount : Number.parseFloat(String(rawAmount).trim());
  if (!Number.isFinite(numeric)) return null;
  const scale = Math.pow(10, 2 - minorUnit);
  return Math.round(numeric * scale);
}

function parseWooProduct(
  raw: Record<string, unknown>,
  sourceUrl: string,
  capturedAtMs: number,
  defaultCurrency: string
): CatalogSnapshot | null {
  if (!isRecord(raw.prices)) return null;
  const prices = raw.prices;
  const minorUnit = typeof prices.currency_minor_unit === 'number' ? prices.currency_minor_unit : 2;
  const currency = typeof prices.currency_code === 'string' && prices.currency_code.length > 0
    ? prices.currency_code.toUpperCase()
    : defaultCurrency;

  const basePriceCents = scaleMinorUnitToCents(prices.price, minorUnit);
  if (basePriceCents === null) return null;
  const regularPriceCents = scaleMinorUnitToCents(prices.regular_price, minorUnit);
  const compareAt = regularPriceCents !== null && regularPriceCents > basePriceCents ? regularPriceCents : null;

  const productId = String(raw.id ?? raw.slug ?? 'woo-product');
  const title = String(raw.name ?? raw.title ?? productId);
  const handle = typeof raw.slug === 'string' && raw.slug.length > 0 ? raw.slug : slugifyHandle(title);
  const inStock = Boolean(raw.is_in_stock) && raw.is_purchasable !== false;
  const lowStock = typeof raw.low_stock_remaining === 'number' ? raw.low_stock_remaining : null;

  const variants: VariantSnapshot[] = [];
  const rawVariations = Array.isArray(raw.variations) ? raw.variations : [];
  let parsedDetailedVariations = false;

  for (const v of rawVariations) {
    if (!isRecord(v) || (!('is_in_stock' in v) && !isRecord(v.prices))) continue;
    parsedDetailedVariations = true;
    const vPrices = isRecord(v.prices) ? v.prices : prices;
    const vMinor = typeof vPrices.currency_minor_unit === 'number' ? vPrices.currency_minor_unit : minorUnit;
    const vPrice = scaleMinorUnitToCents(vPrices.price, vMinor) ?? basePriceCents;
    const vReg = scaleMinorUnitToCents(vPrices.regular_price, vMinor);
    const vAvail = 'is_in_stock' in v ? Boolean(v.is_in_stock) : inStock;
    const vLow = typeof v.low_stock_remaining === 'number' ? v.low_stock_remaining : lowStock;
    const attrs = Array.isArray(v.attributes)
      ? v.attributes
          .filter(isRecord)
          .map((a) => String(a.value ?? a.option ?? ''))
          .filter(Boolean)
          .join(' / ')
      : '';

    variants.push({
      variantId: String(v.id ?? `${productId}-${variants.length + 1}`),
      sku: typeof v.sku === 'string' && v.sku.length > 0 ? v.sku : (typeof raw.sku === 'string' && raw.sku.length > 0 ? raw.sku : null),
      title: attrs || String(v.name ?? 'Default'),
      available: vAvail,
      inventoryQuantity: vLow,
      lowStockRemaining: vLow,
      priceCents: vPrice,
      compareAtPriceCents: vReg !== null && vReg > vPrice ? vReg : compareAt,
      currency
    });
  }

  if (!parsedDetailedVariations) {
    variants.push({
      variantId: productId,
      sku: typeof raw.sku === 'string' && raw.sku.length > 0 ? raw.sku : null,
      title: 'Default',
      available: inStock,
      inventoryQuantity: lowStock,
      lowStockRemaining: lowStock,
      priceCents: basePriceCents,
      compareAtPriceCents: compareAt,
      currency
    });
  }

  const brands = Array.isArray(raw.brands) ? raw.brands : [];
  const firstBrand = brands.length > 0 && isRecord(brands[0]) && typeof brands[0].name === 'string' ? brands[0].name : null;

  return {
    sourceUrl,
    platform: 'woocommerce',
    capturedAtMs,
    productId,
    handle,
    title,
    vendor: firstBrand,
    variants
  };
}

function parseSchemaAvailability(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw !== 'string') return false;
  const token = raw.trim().split('/').pop()?.toLowerCase() ?? '';
  return (
    token === 'instock' ||
    token === 'limitedavailability' ||
    token === 'onlineonly' ||
    token === 'instoreonly'
  );
}

function matchesSchemaType(rawType: unknown, target: string): boolean {
  if (typeof rawType === 'string') {
    return rawType.toLowerCase() === target.toLowerCase() || rawType.toLowerCase().endsWith('/' + target.toLowerCase());
  }
  if (Array.isArray(rawType)) {
    return rawType.some((entry) => matchesSchemaType(entry, target));
  }
  return false;
}

function collectJsonLdNodes(node: unknown, out: Array<Record<string, unknown>>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdNodes(item, out);
    return;
  }
  if (!isRecord(node)) return;
  if (Array.isArray(node['@graph'])) {
    collectJsonLdNodes(node['@graph'], out);
  }
  if (matchesSchemaType(node['@type'], 'Product') || matchesSchemaType(node['@type'], 'ProductGroup')) {
    out.push(node);
  }
}

function extractOfferVariants(
  offersRaw: unknown,
  fallbackId: string,
  fallbackSku: string | null,
  fallbackTitle: string,
  defaultCurrency: string
): VariantSnapshot[] {
  const variants: VariantSnapshot[] = [];
  const offerList = Array.isArray(offersRaw) ? offersRaw : isRecord(offersRaw) ? [offersRaw] : [];

  for (const offer of offerList) {
    if (!isRecord(offer)) continue;
    if (matchesSchemaType(offer['@type'], 'AggregateOffer') && Array.isArray(offer.offers) && offer.offers.length > 0) {
      variants.push(
        ...extractOfferVariants(
          offer.offers,
          fallbackId,
          fallbackSku,
          fallbackTitle,
          typeof offer.priceCurrency === 'string' ? offer.priceCurrency.toUpperCase() : defaultCurrency
        )
      );
      continue;
    }

    const currency = typeof offer.priceCurrency === 'string' && offer.priceCurrency.length > 0
      ? offer.priceCurrency.toUpperCase()
      : defaultCurrency;
    const rawPrice = offer.price ?? offer.lowPrice ?? (isRecord(offer.priceSpecification) ? offer.priceSpecification.price : undefined);
    const priceCents = parseDecimalToCents(rawPrice as string | number | undefined, false);
    if (priceCents === null) continue;

    const highCents = parseDecimalToCents(offer.highPrice as string | number | undefined, false);
    const sku = typeof offer.sku === 'string' && offer.sku.length > 0 ? offer.sku : fallbackSku;
    const varId = String(offer.sku ?? offer['@id'] ?? offer.identifier ?? `${fallbackId}-${variants.length + 1}`);
    const invLevel = isRecord(offer.inventoryLevel) && typeof offer.inventoryLevel.value === 'number'
      ? offer.inventoryLevel.value
      : null;

    variants.push({
      variantId: varId,
      sku,
      title: typeof offer.name === 'string' && offer.name.length > 0 ? offer.name : fallbackTitle,
      available: 'availability' in offer ? parseSchemaAvailability(offer.availability) : true,
      inventoryQuantity: invLevel,
      lowStockRemaining: invLevel !== null && invLevel > 0 && invLevel <= 10 ? invLevel : null,
      priceCents,
      compareAtPriceCents: highCents !== null && highCents > priceCents ? highCents : null,
      currency
    });
  }

  return variants;
}

function extractJsonLdSnapshots(
  html: string,
  sourceUrl: string,
  capturedAtMs: number,
  defaultCurrency: string,
  diagnostics: string[]
): CatalogSnapshot[] {
  const snapshots: CatalogSnapshot[] = [];
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    const rawJson = match[1].trim();
    if (!rawJson) continue;
    try {
      const parsed: unknown = JSON.parse(rawJson);
      const productNodes: Array<Record<string, unknown>> = [];
      collectJsonLdNodes(parsed, productNodes);

      for (const node of productNodes) {
        const productId = String(node.productID ?? node.sku ?? node.mpn ?? node['@id'] ?? slugifyHandle(String(node.name ?? 'product')));
        const title = String(node.name ?? productId);
        const handle = slugifyHandle(title);
        const vendor = isRecord(node.brand) && typeof node.brand.name === 'string'
          ? node.brand.name
          : typeof node.brand === 'string'
            ? node.brand
            : null;
        const baseSku = typeof node.sku === 'string' && node.sku.length > 0 ? node.sku : null;

        const variants: VariantSnapshot[] = [];
        if (Array.isArray(node.hasVariant)) {
          for (const sub of node.hasVariant) {
            if (!isRecord(sub)) continue;
            const subSku = typeof sub.sku === 'string' ? sub.sku : baseSku;
            const subTitle = typeof sub.name === 'string' ? sub.name : 'Default';
            variants.push(...extractOfferVariants(sub.offers, String(subSku ?? productId), subSku, subTitle, defaultCurrency));
          }
        }
        if (variants.length === 0 && node.offers !== undefined) {
          variants.push(...extractOfferVariants(node.offers, productId, baseSku, 'Default', defaultCurrency));
        }

        if (variants.length > 0) {
          snapshots.push({
            sourceUrl,
            platform: 'jsonld',
            capturedAtMs,
            productId,
            handle,
            title,
            vendor,
            variants
          });
        }
      }
    } catch {
      diagnostics.push('malformed-jsonld-block-skipped');
    }
  }

  return snapshots;
}

function walkNextDataForProducts(
  node: unknown,
  found: Array<Record<string, unknown>>,
  depth: number
): void {
  if (depth > 14 || node === null || node === undefined) return;
  if (Array.isArray(node)) {
    for (const item of node) walkNextDataForProducts(item, found, depth + 1);
    return;
  }
  if (!isRecord(node)) return;

  const hasName = typeof node.title === 'string' || typeof node.name === 'string';
  const hasVariantsArr = Array.isArray(node.variants) && node.variants.length > 0 && isRecord(node.variants[0]);
  const hasDirectStockAndPrice =
    hasName &&
    ('price' in node || 'priceCents' in node || 'salePrice' in node) &&
    ('inStock' in node || 'available' in node || 'inventory' in node || 'stockQuantity' in node);

  if (hasName && (hasVariantsArr || hasDirectStockAndPrice)) {
    found.push(node);
    return;
  }

  for (const val of Object.values(node)) {
    walkNextDataForProducts(val, found, depth + 1);
  }
}

function normalizeNextProductNode(
  node: Record<string, unknown>,
  sourceUrl: string,
  capturedAtMs: number,
  defaultCurrency: string
): CatalogSnapshot | null {
  const productId = String(node.id ?? node.productId ?? node.slug ?? node.handle ?? 'next-product');
  const title = String(node.title ?? node.name ?? productId);
  const handle = String(node.slug ?? node.handle ?? slugifyHandle(title));
  const vendor = typeof node.brand === 'string'
    ? node.brand
    : typeof node.vendor === 'string'
      ? node.vendor
      : isRecord(node.brand) && typeof node.brand.name === 'string'
        ? node.brand.name
        : null;
  const currency = typeof node.currency === 'string' && node.currency.length > 0
    ? node.currency.toUpperCase()
    : defaultCurrency;

  const variants: VariantSnapshot[] = [];
  if (Array.isArray(node.variants) && node.variants.length > 0) {
    for (const v of node.variants) {
      if (!isRecord(v)) continue;
      const centsMode = typeof v.priceCents === 'number';
      const rawPrice = centsMode ? v.priceCents : (v.salePrice ?? v.price);
      const priceCents = parseDecimalToCents(rawPrice as string | number | undefined, centsMode);
      if (priceCents === null) continue;

      const rawCompare = typeof v.compareAtPriceCents === 'number'
        ? v.compareAtPriceCents
        : (v.compareAtPrice ?? v.compare_at_price ?? v.originalPrice ?? v.msrp);
      const compareCents = parseDecimalToCents(
        rawCompare as string | number | undefined,
        typeof v.compareAtPriceCents === 'number'
      );

      const qty = typeof v.inventoryQuantity === 'number'
        ? v.inventoryQuantity
        : typeof v.inventory === 'number'
          ? v.inventory
          : typeof v.stockQuantity === 'number'
            ? v.stockQuantity
            : null;
      const avail = typeof v.available === 'boolean'
        ? v.available
        : typeof v.inStock === 'boolean'
          ? v.inStock
          : qty !== null
            ? qty > 0
            : false;

      variants.push({
        variantId: String(v.id ?? v.variantId ?? v.sku ?? `${productId}-${variants.length + 1}`),
        sku: typeof v.sku === 'string' && v.sku.length > 0 ? v.sku : null,
        title: String(v.title ?? v.name ?? v.size ?? 'Default'),
        available: avail,
        inventoryQuantity: qty,
        lowStockRemaining: qty !== null && qty > 0 && qty <= 10 ? qty : null,
        priceCents,
        compareAtPriceCents: compareCents !== null && compareCents > priceCents ? compareCents : null,
        currency: typeof v.currency === 'string' ? v.currency.toUpperCase() : currency
      });
    }
  } else {
    const centsMode = typeof node.priceCents === 'number';
    const rawPrice = centsMode ? node.priceCents : (node.salePrice ?? node.price);
    const priceCents = parseDecimalToCents(rawPrice as string | number | undefined, centsMode);
    if (priceCents !== null) {
      const compareCents = parseDecimalToCents(
        (node.compareAtPrice ?? node.originalPrice) as string | number | undefined,
        false
      );
      const qty = typeof node.stockQuantity === 'number'
        ? node.stockQuantity
        : typeof node.inventory === 'number'
          ? node.inventory
          : null;
      const avail = typeof node.inStock === 'boolean'
        ? node.inStock
        : typeof node.available === 'boolean'
          ? node.available
          : qty !== null
            ? qty > 0
            : false;

      variants.push({
        variantId: String(node.sku ?? productId),
        sku: typeof node.sku === 'string' ? node.sku : null,
        title: 'Default',
        available: avail,
        inventoryQuantity: qty,
        lowStockRemaining: qty !== null && qty > 0 && qty <= 10 ? qty : null,
        priceCents,
        compareAtPriceCents: compareCents !== null && compareCents > priceCents ? compareCents : null,
        currency
      });
    }
  }

  if (variants.length === 0) return null;
  return {
    sourceUrl,
    platform: 'nextjs',
    capturedAtMs,
    productId,
    handle,
    title,
    vendor,
    variants
  };
}

function extractNextDataSnapshots(
  html: string,
  sourceUrl: string,
  capturedAtMs: number,
  defaultCurrency: string,
  diagnostics: string[]
): CatalogSnapshot[] {
  const nextScript = /<script\b[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (!nextScript) return [];
  try {
    const parsed: unknown = JSON.parse(nextScript[1].trim());
    const rootTarget = isRecord(parsed) && isRecord(parsed.props) ? parsed.props : parsed;
    const rawNodes: Array<Record<string, unknown>> = [];
    walkNextDataForProducts(rootTarget, rawNodes, 0);

    const snapshots: CatalogSnapshot[] = [];
    const seenIds = new Set<string>();
    for (const node of rawNodes) {
      const snap = normalizeNextProductNode(node, sourceUrl, capturedAtMs, defaultCurrency);
      if (snap && !seenIds.has(snap.productId)) {
        seenIds.add(snap.productId);
        snapshots.push(snap);
      }
    }
    return snapshots;
  } catch {
    diagnostics.push('malformed-next-data-skipped');
    return [];
  }
}

export function extractStorefrontSnapshot(input: ExtractionInput): ExtractionResult {
  const statusCode = input.statusCode ?? 200;
  const capturedAtMs = input.capturedAtMs ?? Date.now();
  const defaultCurrency = (input.defaultCurrency ?? 'USD').toUpperCase();
  const diagnostics: string[] = [];

  const challenge = detectBotChallenge(statusCode, input.headers, input.body);
  if (challenge.challenged) {
    diagnostics.push(`bot-challenge:${challenge.vendor ?? 'unknown'}`);
    return {
      ok: false,
      platform: 'unknown',
      snapshots: [],
      challenge,
      diagnostics
    };
  }

  if (statusCode >= 400) {
    diagnostics.push(`http-error:${statusCode}`);
    return {
      ok: false,
      platform: 'unknown',
      snapshots: [],
      challenge,
      diagnostics
    };
  }

  const trimmed = input.body.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const isWooUrl = /\/wc\/store\/v\d+\/products/i.test(input.url);

      if (Array.isArray(parsed)) {
        const wooSnapshots: CatalogSnapshot[] = [];
        for (const item of parsed) {
          if (isRecord(item) && (isWooUrl || isWooStoreProduct(item))) {
            const snap = parseWooProduct(item, input.url, capturedAtMs, defaultCurrency);
            if (snap) wooSnapshots.push(snap);
          }
        }
        if (wooSnapshots.length > 0) {
          return {
            ok: true,
            platform: 'woocommerce',
            snapshots: wooSnapshots,
            challenge,
            diagnostics
          };
        }
      } else if (isRecord(parsed)) {
        if (isWooUrl || isWooStoreProduct(parsed)) {
          const snap = parseWooProduct(parsed, input.url, capturedAtMs, defaultCurrency);
          if (snap) {
            return {
              ok: true,
              platform: 'woocommerce',
              snapshots: [snap],
              challenge,
              diagnostics
            };
          }
        }

        const isAjaxJs = /\.js(?:\?|$)/i.test(input.url) || typeof parsed.price === 'number';
        if (Array.isArray(parsed.products)) {
          const shopifySnapshots: CatalogSnapshot[] = [];
          for (const p of parsed.products) {
            if (!isRecord(p)) continue;
            const snap = parseShopifyProduct(p, input.url, capturedAtMs, defaultCurrency, false);
            if (snap) shopifySnapshots.push(snap);
          }
          if (shopifySnapshots.length > 0) {
            return {
              ok: true,
              platform: 'shopify',
              snapshots: shopifySnapshots,
              challenge,
              diagnostics
            };
          }
        } else if (isRecord(parsed.product)) {
          const snap = parseShopifyProduct(parsed.product, input.url, capturedAtMs, defaultCurrency, false);
          if (snap) {
            return {
              ok: true,
              platform: 'shopify',
              snapshots: [snap],
              challenge,
              diagnostics
            };
          }
        } else if (Array.isArray(parsed.variants)) {
          const snap = parseShopifyProduct(parsed, input.url, capturedAtMs, defaultCurrency, isAjaxJs);
          if (snap) {
            return {
              ok: true,
              platform: 'shopify',
              snapshots: [snap],
              challenge,
              diagnostics
            };
          }
        }
      }
    } catch {
      diagnostics.push('invalid-json-payload');
    }
  }

  const nextSnapshots = extractNextDataSnapshots(input.body, input.url, capturedAtMs, defaultCurrency, diagnostics);
  const jsonLdSnapshots = extractJsonLdSnapshots(input.body, input.url, capturedAtMs, defaultCurrency, diagnostics);

  if (nextSnapshots.length > 0) {
    if (jsonLdSnapshots.length > 0) {
      diagnostics.push('enriched-with-jsonld');
      for (const ns of nextSnapshots) {
        const matchingLd = jsonLdSnapshots.find((ld) => ld.handle === ns.handle || ld.productId === ns.productId) ?? jsonLdSnapshots[0];
        if (!ns.vendor && matchingLd.vendor) ns.vendor = matchingLd.vendor;
      }
    }
    return {
      ok: true,
      platform: 'nextjs',
      snapshots: nextSnapshots,
      challenge,
      diagnostics
    };
  }

  if (jsonLdSnapshots.length > 0) {
    return {
      ok: true,
      platform: 'jsonld',
      snapshots: jsonLdSnapshots,
      challenge,
      diagnostics
    };
  }

  diagnostics.push('no-structured-catalog-found');
  return {
    ok: false,
    platform: 'unknown' as StorefrontPlatform,
    snapshots: [],
    challenge,
    diagnostics
  };
}
