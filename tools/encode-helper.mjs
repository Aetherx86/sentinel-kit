#!/usr/bin/env node
// Maintainer utility for generating rolling-key encoded byte pools and FNV-1a
// 32-bit hashes used inside each package's src/core/kernel.ts.
// Not shipped in dist/ artifacts.

export function fnv1a32(input) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function packStringPool(strings, seed) {
  const enc = new TextEncoder();
  const offsets = [];
  const lengths = [];
  const rawChunks = [];
  let cursor = 0;

  for (const s of strings) {
    const bytes = enc.encode(s);
    offsets.push(cursor);
    lengths.push(bytes.length);
    rawChunks.push(bytes);
    cursor += bytes.length;
  }

  const pool = new Uint8Array(cursor);
  let writePos = 0;
  for (const chunk of rawChunks) {
    pool.set(chunk, writePos);
    writePos += chunk.length;
  }

  let state = seed >>> 0;
  for (let i = 0; i < pool.length; i++) {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    z = (z ^ (z >>> 16)) >>> 0;
    pool[i] ^= (z & 0xff) ^ ((i * 31) & 0xff);
  }

  return { seed: seed >>> 0, pool: Array.from(pool), offsets, lengths };
}

export function unpackStringPool(seed, pool, offsets, lengths, index) {
  const start = offsets[index];
  const len = lengths[index];
  const out = new Uint8Array(len);

  let state = seed >>> 0;
  for (let i = 0; i < start + len; i++) {
    state = (state + 0x9e3779b9) >>> 0;
    if (i >= start) {
      let z = state;
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
      z = (z ^ (z >>> 16)) >>> 0;
      out[i - start] = pool[i] ^ (z & 0xff) ^ ((i * 31) & 0xff);
    }
  }
  return new TextDecoder().decode(out);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === '--hash') {
    for (const token of args.slice(1)) {
      console.log(`${token} -> 0x${fnv1a32(token).toString(16).padStart(8, '0')}`);
    }
  } else if (args[0] === '--pool') {
    const seed = Number(args[1] || 0x51f2a9c3);
    const items = args.slice(2);
    console.log(JSON.stringify(packStringPool(items, seed)));
  }
}
