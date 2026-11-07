# sentinel-kit

Monorepo of seven small, deterministic B2B and prosumer software tools. None of them call external LLM APIs or ship customer data to third-party inference services; everything runs on static analysis, domain protocols, checksums, and state machines.

Each package splits its public I/O layer (`src/adapters/`, `src/index.ts`, `src/cli.ts`) from an obfuscated core evaluation kernel (`src/core/kernel.ts`). A local build script (`tools/obfuscate.mjs`) strips TypeScript types, packs modules into isolated closures, encrypts core string literals into runtime-decoded byte pools, masks integer constants, mangles internal symbols, and compiles the Go scanner in `06-local-redactor` to a stripped WebAssembly binary.

## Packages

- `packages/01-matrix-pruner`: GitHub Actions / CI matrix pruner and superseded-run canceller. Resolves transitive monorepo diff impact, dampens flaky-suite noise using Wilson score bounds, and meters skipped runner minutes.
- `packages/02-drift-sentinel`: Pre-flight database migration checker for Prisma, Alembic, and Flyway. Flags blocking Postgres lock modes, unsafe type narrowings, `CONCURRENTLY` transaction errors, and schema drift between live and shadow catalogs.
- `packages/03-clinic-preauth`: Browser intake normalizer, ANSI X12 `005010X279A1` (270/271) eligibility builder/parser, NPI/ICD-10/CPT NCCI rule checker, and CMS-1500 (02/12) claim pre-validator for small clinics.
- `packages/04-soc2-collector`: Read-only IAM, MDM, and backup posture evaluator mapped to SOC2 and ISO 27001:2022 controls. Writes AES-256-GCM encrypted snapshots to a hash-chained S3/local directory layout and builds a standalone PDF 1.4 audit binder.
- `packages/05-stock-sentinel`: Storefront inventory and price change monitor for Shopify, WooCommerce Store API, JSON-LD, and Next.js hydration payloads, with CDN flap hysteresis, bot-challenge detection, and HMAC-signed webhooks.
- `packages/06-local-redactor`: Offline PII scanner and PDF content-stream redactor (`Tj` and kerned `TJ` arrays, uncompressed and `FlateDecode`), paired with a `wasip1` WebAssembly checksum module and a zero-plaintext SHA-256 audit manifest.
- `packages/07-repo-guard`: Supply chain check for a repository: invisible Unicode, things that run by themselves, install hooks, risky workflows and committed credentials. One dependency-free Python file.

## Build and Test

Requires Node.js >= 22.6 (tested on v26.12) and Go >= 1.24 (for `redact-scanner.wasm`). There are no external npm dependencies.

```bash
# Build obfuscated dist/ bundles and compile redact-scanner.wasm
npm run build

# Run unit and integration tests against TypeScript source
npm run test:src

# Run behavioral parity checks against the obfuscated dist/ bundles
npm run test:dist

# Full build + source tests + dist verification
npm test
```

Running an individual CLI from its built artifact:

```bash
node packages/01-matrix-pruner/dist/cli.mjs --help
node packages/02-drift-sentinel/dist/cli.mjs --help
node packages/03-clinic-preauth/dist/cli.mjs --help
node packages/04-soc2-collector/dist/cli.mjs --help
node packages/05-stock-sentinel/dist/cli.mjs --help
node packages/06-local-redactor/dist/cli.mjs --help
```

## Architectural Comparison vs Industry Alternatives

| Dimension / Capability | Sentinel Kit | Conventional SaaS (Drata/Bytebase) | Cloud LLM Code Wrappers |
| :--- | :---: | :---: | :---: |
| **Data Privacy & Ingestion** | 100% Local / Air-Gapped | Requires Third-Party Cloud Access | Leaks Proprietary Code to AI APIs |
| **Evaluation Method** | Deterministic AST & State Machines | Heavy Agent / DB Proxy | Probabilistic (Prone to Hallucinations) |
| **CI/CD Execution Latency** | < 0.05 seconds | 10 – 60 seconds (Network I/O) | 3 – 15 seconds (API rate limited) |
| **External Dependencies** | 0 NPM / Node Native | Heavy multi-service footprint | SaaS token auth & subscription |
| **Database Lock Hazard Detection** | Deep Postgres AST Table Locks | Enterprise tier only | Basic regex or unreliable |
| **Audit Evidence Tamper Resistance** | AES-256-GCM + Hash-Chaining | Vendor cloud vault | None (Plaintext responses) |

## Standalone Architecture and Interoperability

`sentinel-kit` is engineered as a standalone, zero-external-dependency suite. Each tool functions as an independent CLI utility and typed programmatic library with zero runtime coupling to external frameworks.

For downstream environments and multi-language toolchains (such as `rusty-chain-kit` or Rust CLI orchestrators):
- Every tool communicates via deterministic standard input/output and structured JSON (`--json` flag).
- Exit codes follow standard POSIX conventions (`0` = Clean / Pass, `1` = Warning / Caution, `2` = Blocking / Error).
- Native Rust callers or orchestration agents can consume `sentinel-kit` binaries as zero-overhead child processes or embed the compiled WebAssembly scanner modules (`redact-scanner.wasm`) directly into Wasmtime/Wasmer runtimes.

## Notes and Design Docs

- [docs/business-models-and-gtm.md](docs/business-models-and-gtm.md): Pricing math, COGS breakdown, acquisition wedges, and 30-60 day rollout order.
- [docs/architecture-and-internals.md](docs/architecture-and-internals.md): Runtime topology, protocol notes, and how adapters feed each package's kernel.
- [docs/obfuscation-design.md](docs/obfuscation-design.md): Source-level VM/table encoding, `tools/obfuscate.mjs` passes, and threat boundaries.
