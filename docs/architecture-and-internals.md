# System Architectures and Kernel Internals

Every package under `packages/` follows the same boundary so a one- or two-person team can run it on cheap commodity VMs (or zero backend servers for local tools):

```
CLI / Webhook / Extension Adapter
              |
              v   (normalized typed input)
      src/core/kernel.ts
              |
              v   (decision struct / rewritten bytes)
Output Formatter / Signed Webhook / Binary File
```

---

## 01. CI/CD Test Matrix Pruner (`packages/01-matrix-pruner`)

### Topology
A stateless HTTP webhook handler receives GitHub `pull_request`, `push`, `workflow_run`, and `workflow_job` events verified via `X-Hub-Signature-256`. Teams can also invoke the CLI directly in an early Actions job (`outputs.matrix`) before fan-out. Persistent state is limited to a runner-minute ledger and rolling pass/fail/retry counters over the last 100 runs per suite.

### Kernel Behavior
`adapters/git-diff.ts` maps modified file paths to workspace packages and flags global invalidations (lockfiles, `.github/workflows/*`, root build configs). The kernel propagates dirty bits up the reverse dependency graph to find affected targets.

To avoid wasting macOS and Windows minutes on noisy suites, the kernel applies a Wilson score lower-bound filter that separates true regression failures from chronically flaky suites (jobs that fail and pass on same-SHA retries). High-flake suites stay pinned to the primary Linux x64 anchor cell instead of fanning out across every OS/runtime combination. Whenever non-documentation code changes, an anchor rule guarantees at least one primary Linux cell runs. A separate pass identifies superseded runs on the same `(repo, branch, workflow)` tuple and hung jobs past p95 duration limits.

---

## 02. Database Migration Drift Sentinel (`packages/02-drift-sentinel`)

### Topology
Runs as a stateless CI check during pull requests. It reads candidate SQL files from disk (`prisma/migrations`, Flyway `V*__*.sql`, or Alembic offline SQL) and queries `pg_catalog` / `information_schema` on staging or shadow instances. Table rows are never queried.

### Kernel Behavior
`adapters/frameworks.ts` strips `--` comments, nested `/* */` comments, and `$tag$...$tag$` dollar-quoted PL/pgSQL blocks before splitting statements, while tracking explicit `BEGIN`/`COMMIT` blocks and `SET [LOCAL] lock_timeout` settings.

The kernel scores each DDL statement against Postgres lock behavior:
- `CREATE INDEX` without `CONCURRENTLY` on an existing table triggers `BLOCKING` (`SHARE` lock blocks writes), unless that table was created earlier in the same migration.
- `CREATE INDEX CONCURRENTLY` inside an explicit transaction block triggers `BLOCKING` (Postgres runtime error `25001`).
- `ADD COLUMN ... NOT NULL` without `DEFAULT`, or with a volatile default (`random()`, `clock_timestamp()`), triggers `BLOCKING` (`ACCESS EXCLUSIVE` scan/rewrite). Constant defaults on Postgres >= 11 pass as metadata-only.
- Narrowing `ALTER COLUMN ... TYPE` changes (`bigint` -> `int`, `varchar(255)` -> `varchar(50)`) trigger `BLOCKING` due to table rewrite and truncation risk.
- `ADD CONSTRAINT ... FOREIGN KEY` without `NOT VALID` flags cross-table lock contention unless paired with `NOT VALID` and a separate `VALIDATE CONSTRAINT`.

For drift checks, `adapters/catalog.ts` normalizes live and shadow table/column/index/FK definitions so the kernel can hash and diff structural changes caused by manual hotfixes.

---

## 03. Clinic Intake and Insurance Pre-Auth Validator (`packages/03-clinic-preauth`)

### Topology
A Manifest V3 browser extension captures intake form fields from clinic web portals (JaneApp, SimplePractice, WebPT, OpenDental web forms) and sends an HMAC-signed payload to a stateless gateway holding Stedi or Change Healthcare credentials under a BAA. The gateway exchanges ANSI X12 `270`/`271` messages and returns a CMS-1500 (02/12) pre-check result.

### Kernel Behavior
The kernel checks 10-digit NPIs using the ISO Luhn mod-10 formula with the `80840` US healthcare prefix, validates ICD-10-CM code structure, checks CPT/HCPCS formatting, enforces therapy plan-of-care modifiers (`GP`, `GO`, `GN` on `97xxx` procedures) and telehealth modifiers (`95`, `GT` on POS `02`/`10`), and catches NCCI mutually exclusive or unbundled CPT pairs missing modifier `59`/`XE`/`XS`.

`adapters/x12-edi.ts` serializes `005010X279A1` `270` inquiries with fixed-width 10-character `ISA06`/`ISA08` headers and parses `271` `EB` benefit segments (active `1` vs inactive `6`, deductible, copay, coinsurance, prior-auth flags) and `AAA` reject codes. `adapters/cms1500.ts` assembles Boxes 1-33 and verifies Box 21 to Box 24E diagnosis pointer references.

---

## 04. SOC2 and ISO 27001 Evidence Collector (`packages/04-soc2-collector`)

### Topology
A scheduled read-only collector ingests cloud IAM, endpoint MDM, backup snapshot, and repo branch-protection JSON payloads, writes encrypted artifacts into an S3-compatible path layout (`YYYY/MM/DD/<id>.enc`), and outputs a standalone binary PDF 1.4 binder without headless browsers or external PDF libraries.

### Kernel Behavior
The kernel evaluates posture data against SOC2 criteria (`CC6.1`, `CC6.2`, `CC6.6`, `CC7.2`, `CC8.1`, `A1.2`) and ISO/IEC 27001:2022 Annex A controls (`A.5.15`, `A.5.17`, `A.8.1`, `A.8.9`, `A.8.13`, `A.8.24`).

`adapters/vault.ts` encrypts each snapshot with AES-256-GCM using a random 96-bit IV and an HKDF-SHA256 key derived per artifact, appending an entry to `manifest.chain.json` where `chainHash = SHA256(prevChainHash || timestamp || artifactId || plaintextSha256 || ciphertextSha256)`. Any tampered ciphertext or deleted snapshot breaks chain verification. `adapters/pdf-binder.ts` writes raw PDF objects (`Catalog`, `Pages`, Type1 fonts, page streams) with exact byte-offset `xref` entries and stamps the vault chain tip hash onto the summary page.

---

## 05. Headless E-Commerce Stock Drop Sentinel (`packages/05-stock-sentinel`)

### Topology
An async HTTP poller fetches structured storefront feeds first and falls back to residential proxies only when `detectBotChallenge` matches WAF interstitial responses (Cloudflare, PerimeterX, DataDome). Per-SKU state stays in a small memory/Redis struct; outbound alerts carry an `X-Sentinel-Signature-256` HMAC header with exponential retry backoff.

### Kernel Behavior
`adapters/extractors.ts` parses Shopify `/products.json`, WooCommerce `/wp-json/wc/store/v1/products` (scaling `currency_minor_unit`), schema.org `ld+json` product offers, and Next.js `__NEXT_DATA__` payloads into uniform variant snapshots.

To prevent stale CDN edge caches from triggering false restock alerts on single-tick glitches, the kernel requires configurable confirmation ticks and cooldown windows before emitting restock transitions, while firing immediately on verified basis-point price drops. Poll intervals tighten automatically near low-stock thresholds with deterministic `+/- 15%` jitter so polling cadences do not align on fixed second boundaries.

---

## 06. Local Document Redactor and Compliance Packager (`packages/06-local-redactor`)

### Topology
Runs offline in local memory via CLI, desktop wrapper, or browser Web Worker (`redact-scanner.wasm`). No network requests are made and no document contents are retained.

### Kernel and WebAssembly Behavior
Both `src/core/kernel.ts` and `wasm/main.go` (`dist/redact-scanner.wasm`) apply mathematical checksums on top of pattern matching to keep false positives low on invoices and accounting ledgers:
- Payment card PANs: 13-19 digits verified with Luhn mod-10.
- US ABA routing numbers: 9 digits verified with `(3*(d1+d4+d7) + 7*(d2+d5+d8) + (d3+d6+d9)) % 10 === 0` and valid Federal Reserve prefixes.
- IBANs: country length check plus ISO 7064 mod-97 rearrangement (`=== 1`).
- US SSNs: filters out unissued SSA area numbers (`000`, `666`, `900-999`), group `00`, and serial `0000`.

`adapters/pdf-redactor.ts` performs byte-level stream redaction rather than drawing black annotation boxes over selectable text. It inflates `FlateDecode` streams with `zlib`, parses both `(...) Tj` strings and kerned `[ (123-) -40 (45-) -25 (6789) ] TJ` arrays so split tokens cannot slip past the scanner, replaces the underlying characters, recompresses the stream, updates `/Length`, and rebuilds the `xref` table. `buildCompliancePackage` writes a `redaction-manifest.json` containing input/output SHA-256 digests and entity counts with zero plaintext values.
