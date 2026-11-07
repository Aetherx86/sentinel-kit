# @sentinel-kit/local-redactor

Zero-retention local document redaction, Go-to-WebAssembly checksum scanner, true PDF content-stream operator rewriter, and cryptographic compliance packager. Built on Node.js standard library modules and compiled WebAssembly with zero external npm dependencies and zero network or cloud API calls.

## Technical Architecture

Accounting, legal, and M&A diligence workflows routinely handle tax schedules, closing statements, and wire instructions that cannot leave air-gapped or client-controlled workstations. Naive PDF redaction tools draw black vector rectangles over sensitive text while leaving plaintext bytes intact inside compressed streams. `@sentinel-kit/local-redactor` removes underlying characters from document streams locally and emits a verifiable SHA-256 audit manifest containing zero redacted plaintext.

1. **Deterministic Checksum & Span-Resolution Kernel (`src/core/kernel.ts`)**
   - **Mathematical Entity Validation**:
     - `SSN`: Enforces SSA allocation rules, rejecting area `000`, `666`, `900-999`, group `00`, and serial `0000`.
     - `PAN`: Validates 13-to-19-digit payment card numbers via Luhn mod-10 checksum.
     - `ABA_ROUTING`: Validates 9-digit US routing transit numbers against `3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9) mod 10 == 0` and Federal Reserve routing prefixes.
     - `IBAN`: Validates 15-to-34-character ISO 13616 bank account numbers via rearranged `mod 97 == 1`.
     - `EIN`, `EMAIL`, `PHONE`, `CLIENT_LABEL`, `ACCOUNT_ID`, and user-defined `CUSTOM` literal or regular-expression rules.
   - **Overlap Resolution**: Resolves competing matches deterministically by span length and category specificity priority, supporting irreversible category tokens (`[REDACTED:SSN]`) or length-preserving masks (`***********`).

2. **Go-to-WebAssembly Linear-Memory Scanner (`wasm/main.go` + `src/adapters/wasm-bridge.ts`)**
   - Compiled with `GOOS=wasip1 GOARCH=wasm go build -ldflags="-s -w" -trimpath` into `dist/redact-scanner.wasm`.
   - Exports C-ABI functions (`validate_ssn`, `validate_luhn`, `validate_aba`, `validate_iban_mod97`, `rolling_mask_span`, `scan_checksum_spans`) over a static linear-memory arena.
   - Instantiated via standard `WebAssembly.instantiate` with a lightweight pure-JS `wasi_snapshot_preview1` host stub so it executes identically in browsers and Node.js without `node:wasi` experimental flags, falling back automatically to the TypeScript kernel if `.wasm` binaries are omitted.

3. **True PDF Byte-Stream Redactor (`src/core/kernel.ts` + `src/adapters/pdf-redactor.ts`)**
   - Inflates `FlateDecode` page content streams via `node:zlib`, parses `(...) Tj`, `<hex> Tj`, `'`, `"`, and `[ (...) -120 (...) ] TJ` text-showing operators, and reconstructs kerning-split strings (such as `[(123-) -50 (45-6789)] TJ`) prior to PII detection.
   - Deletes underlying PII characters from the stream, re-deflates modified streams, updates `/Length` dictionary entries, and rebuilds a binary `%PDF-1.4` file with recalculated 20-byte `xref` table offsets.

4. **Zero-Retention Compliance Manifest (`buildCompliancePackage`, `processBatchDirectory`)**
   - Produces `redaction-manifest.json` containing input/output SHA-256 digests, canonical policy hash, category hit counts, Wasm backend status, and package integrity digest without recording redacted strings or character snippets.

## Build & Verification

```bash
# Compile stripped Go WebAssembly scanner
cd wasm
GOOS=wasip1 GOARCH=wasm go build -ldflags="-s -w" -trimpath -o ../dist/redact-scanner.wasm main.go
cd ..

# Run verification suite
node --no-warnings --test test/local-redactor.test.ts
```

## Programmatic Usage

```ts
import {
  buildCompliancePackage,
  loadWasmScanner,
  redactPdfBuffer,
  redactText
} from './src/index.ts';

const scanner = await loadWasmScanner();
const isValidIban = scanner.validateIbanMod97('DE89370400440532013000');

const redactedPdf = redactPdfBuffer(rawPdfBytes, {
  customRules: [
    { id: 'client_entity', label: 'CLIENT', pattern: 'Meridian Holdings LLC', literal: true }
  ]
});

const manifest = buildCompliancePackage({
  documents: [
    {
      documentName: 'k1-schedule.pdf',
      format: 'pdf',
      inputBytes: rawPdfBytes,
      outputBytes: redactedPdf.pdfBuffer,
      totalRedactions: redactedPdf.totalRedactions,
      categoryCounts: redactedPdf.categoryCounts
    }
  ],
  wasmBackend: scanner.backend
});
```

## CLI Usage

```bash
# Redact plaintext, CSV, or Markdown files
node --no-warnings src/cli.ts redact-text --input ./memo.txt --custom-literal "Meridian Holdings LLC"

# Redact a binary PDF (uncompressed or FlateDecode) and emit a SHA-256 compliance manifest
node --no-warnings src/cli.ts redact-pdf --input ./wire.pdf --output ./wire.redacted.pdf --manifest ./manifest.json

# Process an entire folder of .pdf, .txt, .csv, .json, and .md documents
node --no-warnings src/cli.ts batch --input-dir ./diligence-room --output-dir ./redacted-bundle
```

## Commercial Packaging & Go-To-Market

### Target Segments
- **CPA & Tax Preparation Practices**: Redacting SSNs, EINs, and bank routing numbers from K-1, W-2, and 1099 workpapers prior to external audit sharing or offshore bookkeeping handoff.
- **Boutique Law Firms & M&A Data Rooms**: Scrubbing client names, payment identifiers, and IBANs across discovery batches on local machines without uploading privileged files to third-party servers.

### Licensing Tiers
| Tier | Pricing | Deployment | Included Capabilities |
| :--- | :--- | :--- | :--- |
| **Solo Practitioner** | USD 39 / seat / mo | Local CLI + Browser Wasm | Unlimited text/PDF redaction, standard PII ruleset |
| **Firm Compliance** | USD 119 / seat / mo | Desktop App + CLI Batch | Custom firm regex dictionaries, SHA-256 compliance certificates |
| **Enterprise Site** | USD 1,490 / yr / site | Air-Gapped Signed Binary | Offline license key, CI/SFTP watch-folder daemon, custom policy templates |

### Unit Economics
100% client-side execution over local CPU and WebAssembly linear memory eliminates server-side document storage, egress bandwidth, and HIPAA/SOC2 hosted-data liability, yielding >97% gross software margins.
