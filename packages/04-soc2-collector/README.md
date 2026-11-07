# @sentinel-kit/soc2-collector

Read-only compliance evidence collector, AES-256-GCM hash-chained vault, posture evaluator, and binary PDF 1.4 audit binder generator for SOC 2 Type I/II and ISO/IEC 27001:2022 Annex A controls.

Zero external npm dependencies. Built entirely on Node.js standard modules (`node:crypto`, `node:fs`, `node:path`, `node:url`).

## Architecture and Scope

The package provides read-only ingestion and cryptographic archiving of operational telemetry without requiring multi-tenant cloud agent installations:

- `src/types.ts`: Strongly typed schemas for raw and normalized IAM configurations, endpoint MDM fleets, database backup metrics, repository branch protection, control evaluations, and tamper-evident vault manifests.
- `src/core/kernel.ts`: Obfuscated compliance posture evaluator and hash-chain sealer. Evaluates SOC 2 Trust Services Criteria (`CC6.1`, `CC6.2`, `CC6.6`, `CC7.2`, `CC8.1`, `A1.2`) and ISO/IEC 27001:2022 controls (`A.5.15`, `A.5.17`, `A.8.1`, `A.8.9`, `A.8.13`, `A.8.24`). Executes AES-256-GCM object encryption with HKDF key derivation and seals each record into an append-only SHA-256 hash chain.
- `src/adapters/collectors.ts`: Normalizers for AWS/GCP IAM dumps, MDM snapshots (FleetDM, Jamf, Kandji, Intune), backup snapshots (RDS, DynamoDB, Cloud SQL), and git repository governance rules.
- `src/adapters/vault.ts`: Local filesystem or S3-compatible encrypted object store partitioned as `<prefix>/YYYY/MM/DD/<artifact>.enc`, backed by `manifest.chain.json`.
- `src/adapters/pdf-binder.ts`: Zero-dependency binary PDF 1.4 compiler generating audit binders with Helvetica/Courier Type 1 fonts, control status matrices, remediation findings, and cryptographic chain seals with exact byte-offset cross-reference tables.
- `src/cli.ts`: Command-line tool supporting `collect`, `verify-vault`, and `export-binder`.

## Programmatic Usage

```ts
import {
  evaluateCompliancePosture,
  runAuditCollection,
  generateAuditBinderPdf,
  VaultStore
} from '@sentinel-kit/soc2-collector';

// Evaluate posture directly in memory
const report = evaluateCompliancePosture(telemetryInput);
console.log(`Readiness: ${report.readinessScore}/100, Status: ${report.overallStatus}`);

// Collect, encrypt, append to hash-chain, and generate PDF binder
const result = runAuditCollection(telemetryInput, {
  vaultRoot: './compliance-vault',
  masterKey: process.env.SOC2_VAULT_KEY,
  binderOutputPath: './dist/soc2-evidence-binder.pdf'
});
```

## CLI Usage

```bash
# Ingest telemetry, encrypt into vault, and generate audit binder PDF
node --no-warnings src/cli.ts collect \
  --input ./fixtures/telemetry.json \
  --vault ./vault \
  --key my-secret-key \
  --pdf ./audit-binder.pdf

# Verify cryptographic hash-chain and ciphertext integrity
node --no-warnings src/cli.ts verify-vault \
  --vault ./vault \
  --key my-secret-key

# Export audit binder PDF directly from telemetry or vault
node --no-warnings src/cli.ts export-binder \
  --input ./fixtures/telemetry.json \
  --out ./audit-binder.pdf
```

## Evaluated Controls Matrix

| Control ID | Framework | Domain | Check Rules |
| :--- | :--- | :--- | :--- |
| `CC6.1` | SOC 2 | Logical Access Security | Root MFA enabled, no root access keys, no unrotated user keys >90d, no wildcard admin policies |
| `CC6.2` | SOC 2 | User Registration & Access | Console user MFA enforcement, active credential review |
| `CC6.6` | SOC 2 | Boundary & Endpoint Protection | Full-disk encryption (FileVault/BitLocker/LUKS), screen lock <=15m |
| `CC7.2` | SOC 2 | System Monitoring & Patching | OS security patch lag <=14d, MDM check-in staleness <=72h |
| `CC8.1` | SOC 2 | Authorized Change Management | Default branch protection enabled, direct pushes blocked, PR reviews required |
| `A1.2` | SOC 2 | Availability & Backup Recovery | Automated snapshots <=24h RPO, backup snapshot encryption enabled, retention >=30d |
| `A.5.15` | ISO 27001 | Access Control Policy | IAM privilege boundaries, MFA enforcement, credential rotation |
| `A.5.17` | ISO 27001 | Authentication Information | Strong auth parameters and secret lifecycle management |
| `A.8.1` | ISO 27001 | User Endpoint Devices | Fleet disk encryption and lock screen compliance |
| `A.8.9` | ISO 27001 | Configuration Management | Infrastructure governance and least-privilege policies |
| `A.8.13` | ISO 27001 | Information Backup | Backup encryption, recovery point objectives, retention schedules |
| `A.8.24` | ISO 27001 | Use of Cryptography | Cryptographic storage of sensitive records and backups |

## Commercial Mechanics & Unit Economics

Seed and early Series A startups often face mandatory enterprise procurement questionnaires requiring SOC 2 Type I readiness or continuous ISO 27001 evidence. Enterprise platforms charge between $10,000 and $20,000 annually.

This tool runs as a stateless CLI or self-hosted GitHub Action writing directly to the customer's own S3 bucket. Operating COGS is zero for hosting and compute.

- **One-time Audit Binder**: $499 flat fee. Generates an encrypted snapshot and verified PDF binder ready for submission to enterprise vendor risk teams.
- **Continuous Monitor**: $99/month per organization. Scheduled daily snapshot runs with automated tamper verification and deficit alerts.
