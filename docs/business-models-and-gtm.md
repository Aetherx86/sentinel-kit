# Business Models, Unit Economics, and 60-Day Rollout

All six packages in this repo avoid external LLM APIs, vector stores, and third-party inference calls. Every feature runs on static analysis, domain wire formats, checksum math, and small state machines.

For a one- or two-person team funding development out of pocket, skipping inference APIs changes three practical realities. First, gross margin stays between 90% and 99% because per-tenant compute is measured in milliseconds of CPU time (or zero, when executed inside the customer's CI runner or browser). You never end up losing money on a $49/month account because a user ran a large batch job. Second, security review is much shorter. Engineering managers, clinic owners, startup CTOs, and law or accounting partners routinely reject tools that forward source code, PHI, IAM configs, or tax PDFs to external model vendors. Third, deterministic checks are auditable: a Postgres lock rule, an ANSI X12 270/271 field check, or a Luhn/IBAN/SSN PDF stream rewrite either matches a known spec or produces a reproducible bug report.

## Rollout Order

Trying to market all six products at once will stall a two-person team. Pick one wedge based on the buyers you can already reach, get it cash-flow positive, and only then decide whether to spin up a second product.

| Order | Package | Initial Wedge | Time to First Sale | Day-60 MRR Target |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `06-local-redactor` | Search traffic ("batch redact SSN PDF offline") + $149 perpetual / $29 seat checkout | 10-18 days | $2,500-$6,000 |
| 2 | `01-matrix-pruner` | Read-only CI waste CLI report -> paid GitHub App install | 18-30 days | $3,000-$8,500 |
| 3 | `02-drift-sentinel` | GitHub Action catching Postgres lock outages on Prisma/Flyway PRs | 20-35 days | $2,000-$5,500 |
| 4 | `04-soc2-collector` | Seed teams closing an enterprise pilot who need an evidence binder fast | 21-40 days | $3,500-$7,500 |
| 5 | `05-stock-sentinel` | Restock and price-error webhook operators on Shopify/WooCommerce | 14-28 days | $2,000-$6,000 |
| 6 | `03-clinic-preauth` | Cold outreach to 2-8 clinician physical therapy and specialty dental offices | 35-60 days | $3,000-$9,000 |

---

## 1. CI/CD Test Matrix Pruner (`01-matrix-pruner`)

### Economics and Pricing
GitHub Actions bills standard 2-core Linux runners at $0.008/min, Windows at $0.016/min, 8-core Linux at $0.032/min, and macOS at $0.08-$0.16/min. A 25-person monorepo running a 3-OS x 3-runtime x 4-shard matrix (36 jobs, 9 minutes each) across 40 PR pushes a day spends $5,500-$9,000/month. Usually more than half of that spend goes to re-running untouched packages or executing superseded commits pushed two minutes apart.

Two pricing options fit standard engineering budgets:
- Flat monthly tiers: $49/mo (up to 3 repos), $149/mo (up to 15 repos + historical flake telemetry), $299/mo (unlimited repos + custom anchor rules and CSV billing exports).
- 20% verified savings share for teams spending over $3,000/month on CI, metered from skipped runner minutes multiplied by published GitHub/AWS runner rates and capped at $999/month so finance does not block it as uncapped variable spend.

Hosting is a stateless webhook worker plus compact pass/fail counters per test suite. At 100 paying teams (~150k webhook events/month), server costs sit under $20/month.

### 60-Day Plan
Days 1-14: Ship a read-only local CLI audit mode that pulls the last 200 workflow runs via `gh api` and prints a plain dollar summary (total spend, superseded commit waste, and full macOS/Windows matrix runs triggered by leaf-package or docs changes). Ask for zero write permissions during the audit.

Days 15-30: Prompt audit users to install the GitHub App to automate pruning and zombie cancellation. Include a single summary line in each PR check showing runner minutes and dollars skipped on that PR.

Days 31-60: Run targeted outbound to Series A/B engineering teams with visible monorepo layouts (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`) or active DevOps job postings.

---

## 2. Database Migration Drift Sentinel (`02-drift-sentinel`)

### Economics and Pricing
An unguarded `ALTER TABLE` on a 40M-row Postgres table acquires an `ACCESS EXCLUSIVE` lock. Even if the table rewrite finishes in 15 seconds, every concurrent `SELECT` and `INSERT` queues behind that lock, exhausting app connection pools and causing an outage. Prisma, Alembic, and Flyway users hit this regularly because ORM migration generators emit DDL that runs fine on an empty local container.

Pricing:
- $39/month for a single database service with unlimited CI PR checks.
- $99/month flat team plan covering up to 8 microservice schemas, live-vs-shadow drift checks, and PR comments showing the non-blocking SQL rewrite (`CONCURRENTLY`, `NOT VALID` + `VALIDATE CONSTRAINT`, `SET LOCAL lock_timeout`).
- $249/month org plan adding hourly out-of-band schema drift polling against staging and production catalogs.

Because the CLI runs inside the customer's CI container and reads only `pg_catalog` / `information_schema` metadata (never table rows), vendor infrastructure only handles license checks and optional schema hash storage (~$0.05/tenant/month).

### 60-Day Plan
Days 1-14: Offer offline SQL lock analysis free on public repos and gate private repos plus live catalog drift checks. Publish three short writeups walking through real Postgres lock incidents caused by ORM-generated migrations.

Days 15-35: List on GitHub Actions Marketplace targeting search terms like `prisma migration check` and `postgres lock linter`.

Days 36-60: Convert SQL-linter users onto the $99/month plan by surfacing live schema drift where someone applied an emergency index or column tweak via `psql` without backporting it to `migrations/`.

---

## 3. Clinic Intake and Insurance Pre-Auth Validator (`03-clinic-preauth`)

### Economics and Pricing
Small physical therapy, occupational therapy, specialty dental, and counseling practices (2 to 10 providers) pay front-desk staff $20-$28/hour. Those staffers routinely lose 10-15 hours a week logging into payer portals, re-typing intake forms, checking remaining therapy visit limits and deductibles, and reworking rejected CMS-1500 claims caused by bad NPIs, subscriber ID typos, missing therapy modifiers (`GP`, `GO`, `GN`), or unbundled CPT pairs.

Pricing:
- $149/month per location: up to 250 ANSI X12 270/271 eligibility checks plus unlimited CMS-1500 pre-checks.
- $299/month per location: up to 800 checks, browser extension capture on JaneApp / SimplePractice / WebPT intake pages, and CPT prior-auth flags.
- $399/month per location: automated 6:00 AM batch checks for next-day scheduled appointments and secondary payer checks.

Wholesale clearinghouse APIs (such as Stedi) charge roughly $0.04-$0.10 per 270/271 transaction. NPI checksums, ICD-10/CPT NCCI bundling rules, and CMS-1500 field validation run in memory at zero marginal cost. A clinic running 500 checks/month on the $299 tier costs $25-$40 in clearinghouse fees (~87% gross margin). Sign a cloud BAA and avoid storing PHI on disk unless the clinic explicitly enables short-term encrypted retry logs.

### 60-Day Plan
Days 1-20: Keep v1 scoped to one specialty: outpatient physical therapy (`CPT 97110, 97140, 97530, 97161-97164`). Therapy billing has strict modifier and visit-cap rules, and reading DOM fields through a browser extension avoids months of EHR integration red tape.

Days 21-40: Download the public NPPES NPI registry CSV, filter by taxonomy `225100000X` (Physical Therapist) for multi-clinician local practices, and contact office managers directly with a two-week pilot on their morning intake schedule.

Days 41-60: Convert the first 10-15 clinics onto $199-$299/month plans. Once front-desk staff use it for daily intake, churn is very low.

---

## 4. SOC2 and ISO 27001 Evidence Collector (`04-soc2-collector`)

### Economics and Pricing
When a 4-person seed startup lands a $40k enterprise pilot, the buyer's security team sends over a questionnaire asking for SOC2 Type I readiness or ISO 27001 evidence (IAM MFA, key rotation, laptop disk encryption, encrypted DB backups, branch protection). Full GRC vendors charge $10,000-$20,000/year on annual contracts, which kills deal momentum for an early team.

Pricing:
- $499 one-time audit pass: read-only collection run, gap list for failing controls, AES-256-GCM encrypted archive, and a timestamped PDF 1.4 evidence binder ready to hand to a buyer's security reviewer or CPA auditor.
- $99/month continuous monitor: scheduled snapshots appended to a hash-chained S3 or local archive (`manifest.chain.json`) covering a 3-to-12-month Type II window, plus immediate alerts if someone disables MFA or leaves an IAM key unrotated past 90 days.

Evidence artifacts land directly in the customer's own S3 bucket, keeping vendor COGS near zero (>97% gross margin).

### 60-Day Plan
Days 1-15: Ship AWS IAM + MDM + backup snapshot evaluation and the standalone PDF binder generator. Host an example generated PDF binder publicly so founders can inspect the exact output before buying.

Days 16-35: Partner with fractional CISOs and small CPA audit shops. Boutique auditors gladly refer a $99/month hash-chained collector to smaller clients because clean, uniform evidence binders save hours of manual screenshot review.

Days 36-60: Convert $499 one-time buyers onto the $99/month continuous chain plan so they accumulate uninterrupted daily timestamps ahead of a formal Type II audit.

---

## 5. Headless E-Commerce Stock Drop Sentinel (`05-stock-sentinel`)

### Economics and Pricing
Resellers, retail arbitrage groups, collectibles dealers, and DTC pricing analysts track hundreds of Shopify, WooCommerce, and Next.js storefronts. Many homegrown monitors launch headless Chromium on every check, burning hundreds of dollars in residential proxy traffic and tripping WAF challenges when 85% of targets already expose structured inventory data in `/products.json`, `/wp-json/wc/store/v1/products`, JSON-LD `AggregateOffer` scripts, or `__NEXT_DATA__` payloads. Naive monitors also spam false restock webhooks whenever a stale CDN edge node serves cached HTML for a single tick.

Pricing:
- $29/month (Solo): 50 tracked targets, 5-minute base interval, signed webhook / Discord alerts.
- $69/month (Operator): 250 targets, 60-second adaptive drop-window polling, basis-point markdown filters, variant SKU matching.
- $119/month (Agency): 1,000 targets, 15-30s burst polling during drops, multi-endpoint HMAC webhook fanout.

HTTP feed polling and the in-memory hysteresis state machine take ~2 KB of RAM per tracked SKU. Escalating to proxy bandwidth only when `detectBotChallenge` sees a real 403/503 interstitial keeps infra + proxy COGS around $3-$7/month on a $69 account (~90%+ gross margin).

### 60-Day Plan
Days 1-14: Ship Shopify, WooCommerce Store API, JSON-LD, and Next.js hydration extractors with anti-flap confirmation ticks and signed webhooks.

Days 15-30: Give 7-day trials to 10 niche arbitrage community admins and e-commerce pricing consultants. Keep a subtle attribution line on free-tier webhook embeds to drive word-of-mouth signups.

Days 31-60: Add CSV bulk target import and steep-discount (>35% price drop) presets to move users from the $29 plan to $69 and $119 tiers.

---

## 6. Local Document Redactor and Compliance Packager (`06-local-redactor`)

### Economics and Pricing
Small accounting offices, immigration and family law firms, M&A advisors, and academic researchers redact SSNs, EINs, routing/account numbers, IBANs, and client names from PDFs daily. Cloud redaction tools violate client confidentiality rules because files get uploaded to a third party. Worse, many desktop PDF editors merely draw black rectangles over text while leaving the underlying `Tj`/`TJ` character strings intact in the PDF stream, allowing anyone to copy-paste the hidden SSN out of the file.

Pricing:
- $19/month (Solo seat) or $49/month (Firm seat with custom policy packs and detached compliance certificates).
- $149 one-time perpetual local license (+ $49/year optional updates). Solo CPAs and attorneys strongly prefer one-time licenses over another monthly bill, which brings in immediate Day-1 cash.

Because scanning and PDF stream rewriting execute locally via WebAssembly and local file I/O, server and storage COGS are $0. Gross margin after payment processing is ~96.5%.

### 60-Day Plan
Days 1-10: Ship the local batch CLI/Wasm engine alongside a free in-browser "Redaction Leak Checker" that inspects an already-redacted PDF locally and warns if selectable text still sits underneath black annotation boxes.

Days 11-30: Target search terms around verifying PDF redaction and batch-redacting tax/legal documents offline. Offer both the $149 perpetual license and $29-$49/month multi-seat plans at checkout.

Days 31-60: Pitch independent CPA alliances, state bar tech directories, and public-records clerks using the zero-PII `redaction-manifest.json` audit receipt (which records input/output SHA-256 hashes and entity counts without storing any redacted plaintext).
