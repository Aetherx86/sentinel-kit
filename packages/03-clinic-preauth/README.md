# @sentinel-kit/clinic-preauth

Deterministic outpatient intake validator, ANSI X12 `005010X279A1` `270`/`271` eligibility engine, prior-authorization adjudicator, and CMS-1500 (02/12) claim pre-check library for independent medical, therapy, behavioral health, and dental practices.

Built on Node.js built-in modules (`node:crypto`, `node:fs`, `node:path`, `node:url`) with zero external npm dependencies and zero runtime LLM calls.

## Architecture and Module Layout

- `src/types.ts`: Strongly typed clinical intake, subscriber policy, X12 270/271 benefit/AAA error structures, CMS-1500 (02/12) box mappings, and EHR browser-extension webhook contracts.
- `src/core/kernel.ts`: Adjudication kernel executing ISO `80840` 10-digit NPI Luhn verification, CMS 11-character Medicare Beneficiary Identifier (MBI) positional masks, ICD-10-CM syntax/7th-character/laterality specificity checks, CPT/HCPCS/CDT + modifier compatibility (`25`, `59`/`XE`/`XS`/`XP`/`XU`, `95`/`GT`, `GP`/`GO`/`GN`), NCCI indicator-0 and indicator-1 procedure pair conflict checks, payer timely-filing windows, and CPT-by-plan prior-authorization matrix scoring.
- `src/adapters/x12-edi.ts`: Generates fixed-106-byte `ISA` ANSI X12 `005010X279A1` `270` Eligibility Inquiry transactions (Loop 2000A..2000D) and parses `271` Eligibility Responses (`EB*1`..`EB*8`, copay `EB*B`, coinsurance `EB*A`, total/remaining deductible `EB*C`, out-of-pocket remaining `EB*G`, prior-auth indicator `EB11=Y`, and `AAA` reject codes) plus normalized clearinghouse JSON envelopes.
- `src/adapters/cms1500.ts`: Maps validated intake + `271` benefit output into a CMS-1500 (02/12) claim pre-check record (Boxes 1, 1a, 2, 3, 4, 5, 6, 11, 17/17b, 21A-L, 23, 24A-J, 25, 26, 28, 31, 32, 33), enforcing diagnosis pointer integrity and calculating upfront patient financial responsibility.
- `src/adapters/extension-bridge.ts`: Sanitizes raw DOM form fields captured from web EHRs (SimplePractice, JaneApp, WebPT, OpenDental), strips session/CSRF/UI noise, and signs/verifies webhook envelopes using HMAC-SHA256 with a 300-second replay window.
- `src/cli.ts`: Command-line interface exposing `validate`, `x12-270`, `parse-271`, and `cms1500`.

## Programmatic Usage

```ts
import {
  validateIntakeAndPreAuth,
  buildX12Eligibility270,
  parseX12Eligibility271,
  generateCms1500Precheck
} from './src/index.ts';

const validation = validateIntakeAndPreAuth(intake);
const x12Inquiry = buildX12Eligibility270(intake, {
  senderId: 'CLINIC001',
  receiverId: intake.coverage.payerId,
  interchangeControlNumber: '000000105'
});

const eligibility = parseX12Eligibility271(raw271Response);
const cmsPrecheck = generateCms1500Precheck(intake, eligibility);
```

## CLI Usage

```sh
node --no-warnings src/cli.ts validate --input intake.json --strict
node --no-warnings src/cli.ts x12-270 --input intake.json --sender CLINIC01 --raw
node --no-warnings src/cli.ts parse-271 --input payer-response.271
node --no-warnings src/cli.ts cms1500 --input intake.json --271 payer-response.271 --strict
```

## B2B SaaS Unit Economics and Go-To-Market (Independent Clinics)

### Target Wedge
Independent outpatient clinics with 2 to 25 clinicians (physical/occupational therapy groups, behavioral health practices, orthopedic clinics, and multi-chair dental offices) lose 6% to 11% of gross billings to front-end technical denials: invalid subscriber IDs, lapsed policies, missing `GP`/`25`/`59` modifiers, unspecific ICD-10 laterality, and missed prior authorizations.

Replacing an EHR is high-friction; installing a lightweight Chrome extension overlay over SimplePractice, WebPT, JaneApp, or OpenDental requires zero EHR migration and intercepts errors 48 hours before patient arrival.

### Unit Economics
- **Pricing**: `$299/month` base clinic subscription (includes 1,000 real-time `270`/`271` checks and unlimited local NCCI/CMS-1500 pre-checks) + `$0.18` per incremental clearinghouse inquiry. Multi-site groups pay `$699/month`.
- **Direct COGS per Clinic**:
  - Clearinghouse wholesale EDI pass-through (Stedi / Claim.MD / Waystar wholesale tier): `$0.03` to `$0.05` per `270`/`271` round-trip (`~$35/month` at 900 checks).
  - Compute and storage: stateless deterministic Node.js execution (`<$2/month` per tenant; zero GPU/LLM inference spend).
  - **Gross Margin**: `87% - 89%`.
- **Customer ROI**: Preventing two denied physical therapy evaluations (`~$360`) or a single unauthorized outpatient MRI/arthroscopy write-off (`$650 - $2,400`) pays for the annual software contract in week one.

### Go-To-Market Execution
1. **Outbound to outsourced RCM and medical billing bureaus**: Independent billing agencies managing 10 to 50 clinics adopt pre-visit intake verification to cut unpaid claim rework hours per biller. One billing bureau partnership onboards 15+ clinics simultaneously.
2. **EHR-adjacent Chrome Web Store distribution**: Publish clinic-specific field mappers for WebPT, SimplePractice, and JaneApp front-desk coordinators with a self-serve NPI + sample CMS-1500 scrubber sandbox.
3. **BAA and HIPAA posture**: Stateless clearinghouse proxy architecture minimizes retained PHI surface area; signed HIPAA Business Associate Agreement included on standard annual plans.
