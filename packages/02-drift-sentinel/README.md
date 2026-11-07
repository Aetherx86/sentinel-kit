# @sentinel-kit/drift-sentinel

Stateless pre-flight check engine that runs in CI/CD pipelines to prevent destructive PostgreSQL schema locks, table rewrites, and staging-to-production schema drift.

## Problem Statement

Database migrations executed under standard ORMs (Prisma, Flyway, Alembic, raw SQL) frequently cause production outages by acquiring `ACCESS EXCLUSIVE` table locks or triggering full table rewrites. Common catastrophic patterns include:
- `CREATE INDEX` on existing multi-gigabyte tables without `CONCURRENTLY`.
- `CREATE INDEX CONCURRENTLY` wrapped inside an explicit transaction block (`BEGIN ... COMMIT`), which PostgreSQL rejects at runtime.
- `ALTER TABLE ... ADD COLUMN ... NOT NULL` without a default value on populated tables.
- Adding columns with volatile defaults (`random()`, `clock_timestamp()`, `uuid_generate_v4()`) on PostgreSQL versions that require physical rewrites.
- Column type modifications that narrow precision or change internal binary storage representations (`varchar(255)` to `varchar(50)`).
- Adding foreign keys without `NOT VALID`, requiring a full blocking sequential scan on referenced and referencing tables.
- Silent schema drift between staging shadow databases and production clusters.

`drift-sentinel` parses migration SQL ASTs, analyzes locking matrices against target PostgreSQL major versions, inspects schema catalogs, and returns deterministic exit codes (`0` for SAFE, `1` for CAUTION, `2` for BLOCKING).

## Core Capabilities

1. **Lock Hazard Analysis**: Evaluates statements against PostgreSQL lock hierarchies (`ACCESS SHARE` through `ACCESS EXCLUSIVE`). Detects missing lock timeouts and blocking DDL patterns.
2. **Context-Aware Table Scope**: Distinguishes between operations on existing production tables versus tables created in the same migration transaction (which carry zero live contention risk).
3. **Type Narrowing and Rewrite Matrix**: Detects dangerous column type changes that force physical table copies versus zero-rewrite metadata operations.
4. **Dollar-Quoted String Safety**: Safely parses PL/pgSQL function bodies, triggers, and dollar-quoted literals (`$func$...$func$`) without producing false positives.
5. **Bidirectional Schema Drift Detection**: Compares live and snapshot schema catalogs (tables, columns, types, nullability, defaults, indexes, foreign keys, check constraints) using deterministic FNV-1a state hashing.

## Installation

```bash
npm install -g @sentinel-kit/drift-sentinel
```

Alternatively, invoke directly via npx in GitHub Actions, GitLab CI, or CircleCI:

```bash
npx @sentinel-kit/drift-sentinel check-sql ./migrations --engine-version 15
```

## CLI Reference

### 1. Check Migrations for DDL Hazards

```bash
drift-sentinel check-sql <path-to-sql-file-or-dir> [options]

Options:
  --engine-version <n>    Target PostgreSQL major version (default: 15)
  --catalog <path>        Base schema catalog JSON to supply existing column types and tables
  --json                  Output structured JSON report
```

Exit Codes:
- `0`: All statements are safe to run concurrently.
- `1`: Cautionary warnings detected (e.g., missing `SET lock_timeout` on index creation).
- `2`: Blocking hazards detected (e.g., non-concurrent index on existing table, destructive rewrite).

### 2. Compare Schema Catalogs (Drift Detection)

```bash
drift-sentinel diff-schema <expected.json> <actual.json> [options]

Options:
  --json                  Output structured JSON drift diff
```

### 3. Integrated Preflight Flight Check

```bash
drift-sentinel preflight \
  --migrations ./prisma/migrations \
  --expected ./schema-baseline.json \
  --actual ./staging-catalog.json \
  --engine-version 16
```

## Programmatic API

```typescript
import {
  analyzeMigrationSafety,
  compareSchemaCatalogs,
  runPreflightCheck
} from '@sentinel-kit/drift-sentinel';

// Analyze SQL files or raw strings
const report = analyzeMigrationSafety(`
  ALTER TABLE users ADD COLUMN phone_number varchar(20) NOT NULL;
`, {
  engineVersion: 15,
  existingTables: ['users']
});

console.log(report.severity); // 'BLOCKING'
console.log(report.hazards[0].code); // 'ADD_COL_NOT_NULL_NO_DEFAULT'
console.log(report.hazards[0].remediation);
```

## GitHub Actions CI Integration

```yaml
name: Database Migration Preflight
on: [pull_request]

jobs:
  verify-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Run Sentinel Preflight Check
        run: |
          npx @sentinel-kit/drift-sentinel check-sql ./migrations \
            --engine-version 15 \
            --catalog ./db/schema-catalog.json
```

## Commercial Model

- **Developer Seat**: $39/seat/month (CLI integration, PR checks, unlimited local runs).
- **Project Flat Rate**: $99/project/month (Unlimited CI runs, webhook alerting, shadow DB drift tracking).
- **Self-Hosted Enterprise**: $499/month (Air-gapped VPC runner, custom compliance audits, SLA support).
