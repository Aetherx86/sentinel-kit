import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectPiiSpansKernel, maskBytesKernel, validateAbaKernel, validateIbanKernel, validateLuhnKernel, validateSsnKernel } from '../core/kernel.ts';
import type { WasmChecksumSpan, WasmScannerBridge } from '../types.ts';

interface RawWasmExports {
  memory: WebAssembly.Memory;
  _start?: () => void;
  arena_ptr: () => number;
  arena_cap: () => number;
  validate_ssn: (offset: number, length: number) => number;
  validate_luhn: (offset: number, length: number) => number;
  validate_aba: (offset: number, length: number) => number;
  validate_iban_mod97: (offset: number, length: number) => number;
  rolling_mask_span: (offset: number, length: number, maskByte: number, preserveDelims: number) => number;
  scan_checksum_spans: (offset: number, length: number, outOffset: number, maxSpans: number) => number;
}

class WasiExitSignal {
  readonly code: number;
  constructor(code: number) {
    this.code = code;
  }
}

function createWasiPreview1Stub(getMemory: () => WebAssembly.Memory | null): Record<string, WebAssembly.ImportValue> {
  return {
    sched_yield: () => 0,
    proc_exit: (code: number) => {
      throw new WasiExitSignal(code);
    },
    args_get: () => 0,
    args_sizes_get: (argcPtr: number, argvBufSizePtr: number) => {
      const mem = getMemory();
      if (mem) {
        const dv = new DataView(mem.buffer);
        dv.setUint32(argcPtr >>> 0, 0, true);
        dv.setUint32(argvBufSizePtr >>> 0, 0, true);
      }
      return 0;
    },
    environ_get: () => 0,
    environ_sizes_get: (countPtr: number, bufSizePtr: number) => {
      const mem = getMemory();
      if (mem) {
        const dv = new DataView(mem.buffer);
        dv.setUint32(countPtr >>> 0, 0, true);
        dv.setUint32(bufSizePtr >>> 0, 0, true);
      }
      return 0;
    },
    clock_time_get: (_clockId: number, _precision: bigint, timePtr: number) => {
      const mem = getMemory();
      if (mem) {
        const dv = new DataView(mem.buffer);
        dv.setBigUint64(timePtr >>> 0, BigInt(Date.now()) * 1_000_000n, true);
      }
      return 0;
    },
    fd_write: (_fd: number, iovsPtr: number, iovsLen: number, nwrittenPtr: number) => {
      const mem = getMemory();
      if (mem) {
        const dv = new DataView(mem.buffer);
        let written = 0;
        for (let i = 0; i < iovsLen; i++) {
          written += dv.getUint32((iovsPtr >>> 0) + i * 8 + 4, true);
        }
        dv.setUint32(nwrittenPtr >>> 0, written, true);
      }
      return 0;
    },
    random_get: (bufPtr: number, bufLen: number) => {
      const mem = getMemory();
      if (mem && bufLen > 0) {
        const view = new Uint8Array(mem.buffer, bufPtr >>> 0, bufLen >>> 0);
        globalThis.crypto.getRandomValues(view);
      }
      return 0;
    },
    poll_oneoff: (_inPtr: number, _outPtr: number, _nsubs: number, neventsPtr: number) => {
      const mem = getMemory();
      if (mem) {
        new DataView(mem.buffer).setUint32(neventsPtr >>> 0, 0, true);
      }
      return 0;
    }
  };
}

function resolveDefaultWasmPath(): string | null {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const candidates = [
      resolve(here, 'redact-scanner.wasm'),
      resolve(here, '../dist/redact-scanner.wasm'),
      resolve(here, '../../dist/redact-scanner.wasm')
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
  } catch {
    return null;
  }
  return null;
}

function createJsFallbackBridge(): WasmScannerBridge {
  return {
    backend: 'js-fallback',
    validateSsn: (input: string) => validateSsnKernel(input),
    validateLuhnPan: (input: string) => validateLuhnKernel(input),
    validateAbaRouting: (input: string) => validateAbaKernel(input),
    validateIbanMod97: (input: string) => validateIbanKernel(input),
    maskBufferSpan: (input: Uint8Array, maskChar?: string, preserveDelimiters = false) => {
      const byteVal = maskChar && maskChar.length > 0 ? maskChar.charCodeAt(0) & 0xff : 0;
      return maskBytesKernel(input, byteVal, preserveDelimiters);
    },
    scanChecksumSpans: (input: string | Uint8Array): WasmChecksumSpan[] => {
      const text = typeof input === 'string' ? input : new TextDecoder().decode(input);
      const spans = detectPiiSpansKernel(text, {
        categories: ['SSN', 'PAN', 'ABA_ROUTING', 'IBAN']
      });
      return spans.map((s) => ({
        start: s.start,
        end: s.end,
        category: s.category as WasmChecksumSpan['category']
      }));
    }
  };
}

const KIND_MAP: Record<number, WasmChecksumSpan['category']> = {
  1: 'SSN',
  2: 'PAN',
  3: 'ABA_ROUTING',
  4: 'IBAN'
};

export async function loadWasmScanner(options?: {
  wasmPath?: string;
  wasmBytes?: Uint8Array;
  forceFallback?: boolean;
}): Promise<WasmScannerBridge> {
  if (options?.forceFallback) {
    return createJsFallbackBridge();
  }

  let bytes: Uint8Array | null = options?.wasmBytes ?? null;
  if (!bytes) {
    const resolvedPath = options?.wasmPath ? resolve(options.wasmPath) : resolveDefaultWasmPath();
    if (!resolvedPath || !existsSync(resolvedPath)) {
      return createJsFallbackBridge();
    }
    bytes = readFileSync(resolvedPath);
  }

  let memRef: WebAssembly.Memory | null = null;
  const mod = new WebAssembly.Module(bytes as BufferSource);
  const preview1 = createWasiPreview1Stub(() => memRef);
  for (const imp of WebAssembly.Module.imports(mod)) {
    if (imp.module === 'wasi_snapshot_preview1' && imp.kind === 'function' && !(imp.name in preview1)) {
      preview1[imp.name] = () => 0;
    }
  }

  const instance = await WebAssembly.instantiate(mod, {
    wasi_snapshot_preview1: preview1
  });
  const exports = instance.exports as unknown as RawWasmExports;
  memRef = exports.memory;

  if (typeof exports._start === 'function') {
    try {
      exports._start();
    } catch (err) {
      if (!(err instanceof WasiExitSignal)) {
        throw err;
      }
    }
  }

  const encoder = new TextEncoder();
  const basePtr = exports.arena_ptr() >>> 0;
  const capacity = exports.arena_cap() >>> 0;

  function writeSlice(raw: Uint8Array, offset = 0): number {
    if (offset + raw.byteLength > capacity) {
      throw new RangeError('Input exceeds Wasm scanner linear arena capacity');
    }
    new Uint8Array(exports.memory.buffer, basePtr + offset, raw.byteLength).set(raw);
    return raw.byteLength;
  }

  return {
    backend: 'wasm',
    validateSsn(input: string): boolean {
      const encoded = encoder.encode(input);
      const len = writeSlice(encoded, 0);
      return exports.validate_ssn(0, len) === 1;
    },
    validateLuhnPan(input: string): boolean {
      const encoded = encoder.encode(input);
      const len = writeSlice(encoded, 0);
      return exports.validate_luhn(0, len) === 1;
    },
    validateAbaRouting(input: string): boolean {
      const encoded = encoder.encode(input);
      const len = writeSlice(encoded, 0);
      return exports.validate_aba(0, len) === 1;
    },
    validateIbanMod97(input: string): boolean {
      const encoded = encoder.encode(input);
      const len = writeSlice(encoded, 0);
      return exports.validate_iban_mod97(0, len) === 1;
    },
    maskBufferSpan(input: Uint8Array, maskChar?: string, preserveDelimiters = false) {
      const len = writeSlice(input, 0);
      const maskByte = maskChar && maskChar.length > 0 ? maskChar.charCodeAt(0) & 0xff : 0;
      const scrubbedBytes = exports.rolling_mask_span(0, len, maskByte, preserveDelimiters ? 1 : 0) >>> 0;
      const output = new Uint8Array(len);
      output.set(new Uint8Array(exports.memory.buffer, basePtr, len));
      return { output, scrubbedBytes };
    },
    scanChecksumSpans(input: string | Uint8Array): WasmChecksumSpan[] {
      const raw = typeof input === 'string' ? encoder.encode(input) : input;
      const maxInputCap = capacity - 12288;
      if (raw.byteLength > maxInputCap) {
        return createJsFallbackBridge().scanChecksumSpans(raw);
      }
      const len = writeSlice(raw, 0);
      const outOffset = Math.min(capacity - 12288, ((len + 15) & ~15));
      const maxSpans = Math.floor((capacity - outOffset) / 12);
      const count = exports.scan_checksum_spans(0, len, outOffset, maxSpans) >>> 0;
      const dv = new DataView(exports.memory.buffer, basePtr + outOffset, count * 12);
      const results: WasmChecksumSpan[] = [];
      for (let i = 0; i < count; i++) {
        const start = dv.getUint32(i * 12, true);
        const end = dv.getUint32(i * 12 + 4, true);
        const kind = dv.getUint32(i * 12 + 8, true);
        const category = KIND_MAP[kind];
        if (category) {
          results.push({ start, end, category });
        }
      }
      return results;
    }
  };
}
