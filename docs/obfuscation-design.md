# Core Obfuscation Design and Maintainer Notes

Five of the six tools in this repository ship code into environments operated by the customer: CI runners (`01-matrix-pruner`, `02-drift-sentinel`), clinic browser profiles (`03-clinic-preauth`), startup AWS/workstation environments (`04-soc2-collector`), and offline legal/accounting machines (`06-local-redactor`).

Distributing readable, commented TypeScript in self-serve packages invites two predictable problems: copycats lift domain rule tables (Postgres lock conditions, NCCI procedure edits, SOC2 mappings, storefront hysteresis thresholds) straight out of `node_modules`, and casual users patch out local repo or seat limits. On the other hand, obfuscating the entire repository makes debugging adapter or CLI issues painful.

To keep day-to-day maintenance sane, each package draws a hard line between two layers:

- `src/types.ts`, `src/adapters/`, `src/index.ts`, `src/cli.ts`: normal, typed TypeScript handling file I/O, wire formatting, HTTP/webhook framing, and CLI flags.
- `src/core/kernel.ts` (plus `wasm/main.go` in `06-local-redactor`): the scoring logic, domain rule tables, checksum validators, and state machines.

## Two-Pass Protection

### 1. Source-Level Kernel Encoding (`src/core/kernel.ts`)

Each `kernel.ts` avoids plain `if/else` rule trees and readable keyword literals:

- Byte pools: rule strings, status tags, and token fragments live inside `Uint8Array` buffers XORed against a 32-bit `splitmix32` keystream (`0x9e3779b9` step mixed with `0x85ebca6b` and `0xc2b2ae35`, plus index mixing). Running `strings` or `grep` over `kernel.ts` does not turn up SQL lock keywords, CPT codes, or compliance control IDs.
- FNV-1a token matching: normalized identifiers are hashed with 32-bit FNV-1a (`0x811c9dc5` basis, `0x01000193` prime) and matched against integer constants instead of string comparisons.
- Bit-packed tables: multi-factor rules (such as lock mode x transaction block x Postgres major version) are packed into `Uint32Array` words.
- Flattened dispatch loops: core evaluators run inside `while (_st !== 0) { switch (_st) { ... } }` loops over short register variables rather than named helper call chains.

### 2. Build-Time Bundling and Mangling (`tools/obfuscate.mjs`)

`npm run build` runs `tools/obfuscate.mjs` using only Node built-ins (`stripTypeScriptTypes` + a custom JS lexical scanner) to emit standalone `dist/index.mjs` and `dist/cli.mjs` bundles per package:

1. Strips TypeScript annotations and wraps each local module inside an isolated IIFE closure (`const _$m0_a1f = (() => { ... })();`).
2. Scans `src/core/*` modules for any remaining string literals, packs them into a salted `Uint8Array` table, and swaps literals for memoized lookup calls (`_$s8f2(0)`).
3. Rewrites integer constants (`2 .. 0x3fffffff`) in `src/core/*` into bitwise XOR pairs such as `(0x1f84ce12^0x1f84ce18)` so FNV-1a constants and bitmasks cannot be matched directly.
4. Renames module-private bindings in `src/core/*` to hex-prefixed symbols while preserving exported API names.
5. Compiles `packages/06-local-redactor/wasm/main.go` with `GOOS=wasip1 GOARCH=wasm go build -ldflags="-s -w" -trimpath` into `dist/redact-scanner.wasm`, stripping symbol and DWARF sections.

## Updating Hashes and Byte Pools

Do not hand-edit byte arrays in `kernel.ts`. Use `tools/encode-helper.mjs` (which stays in the repo root and is never bundled into `dist/`):

```bash
# Print 32-bit FNV-1a hashes
node tools/encode-helper.mjs --hash CONCURRENTLY ACCESS_EXCLUSIVE VALIDATE

# Generate a rolling-XOR byte pool for an array of strings
node tools/encode-helper.mjs --pool 0x51f2a9c3 "CC6.1" "CC6.6" "A1.2" "A.5.15"
```

## Testing Against Build Regressions

Lexical transforms can break subtle JS constructs (division vs regex literals, object shorthand bindings, or `1 .toString()` spacing) if left unchecked. Two separate test stages catch this:

- `npm run test:src` runs each package's test suite directly against `src/*.ts`.
- `npm run test:dist` imports the built `packages/*/dist/index.mjs` bundles and invokes `packages/*/dist/cli.mjs`, checking that outputs match the source modules and verifying that comments and internal symbol names are stripped from `dist/`.

## Threat Model Limits

Client-side obfuscation raises the cost of casual scraping, automated prompt-cloning, and quick license-check edits. It does not replace server boundaries against a dedicated reverse engineer with a debugger. Keep third-party credentials (clearinghouse API keys in `03-clinic-preauth`, proxy credentials and shared polling queues in `05-stock-sentinel`, webhook secrets, and billing state) on your server rather than inside distributed binaries.
