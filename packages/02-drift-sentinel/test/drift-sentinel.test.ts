import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMigrationSafety,
  compareSchemaCatalogs,
  runPreflightCheck,
  canonicalizePgTypeKernel,
  normalizeCatalog
} from '../src/index.ts';
import { runCli } from '../src/cli.ts';

test('1. Non-concurrent CREATE INDEX on existing table triggers BLOCKING', () => {
  const sql = 'CREATE INDEX idx_users_email ON users (email);';
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'INDEX_NON_CONCURRENT');
  assert.ok(hazard, 'Must flag INDEX_NON_CONCURRENT');
  assert.equal(hazard?.tableName, 'users');
});

test('2. CREATE INDEX without CONCURRENTLY on newly created table passes as SAFE', () => {
  const sql = `
    CREATE TABLE new_orders (
      id serial PRIMARY KEY,
      amount numeric(10, 2)
    );
    CREATE INDEX idx_new_orders_amount ON new_orders (amount);
  `;
  const report = analyzeMigrationSafety(sql);

  assert.equal(report.severity, 'SAFE');
  assert.equal(report.exitCode, 0);
  assert.equal(report.hazards.length, 0);
  assert.ok(report.newlyCreatedTables.includes('new_orders'));
});

test('3. CREATE INDEX CONCURRENTLY inside explicit transaction block triggers BLOCKING', () => {
  const sql = `
    BEGIN;
    CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
    COMMIT;
  `;
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'CONCURRENT_IN_TX');
  assert.ok(hazard, 'Must flag CONCURRENT_IN_TX');
});

test('4. ADD COLUMN ... NOT NULL without DEFAULT triggers BLOCKING', () => {
  const sql = 'ALTER TABLE users ADD COLUMN is_verified boolean NOT NULL;';
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'ADD_COL_NOT_NULL_NO_DEFAULT');
  assert.ok(hazard, 'Must flag ADD_COL_NOT_NULL_NO_DEFAULT');
});

test('5. ADD COLUMN ... NOT NULL with volatile DEFAULT triggers BLOCKING', () => {
  const sql = 'ALTER TABLE users ADD COLUMN token text NOT NULL DEFAULT random()::text;';
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'ADD_COL_VOLATILE_DEFAULT');
  assert.ok(hazard, 'Must flag ADD_COL_VOLATILE_DEFAULT');
});

test('6. ADD COLUMN with constant DEFAULT on PG 15 flags missing lock_timeout as CAUTION', () => {
  const sql = 'ALTER TABLE users ADD COLUMN status varchar(20) NOT NULL DEFAULT \'pending\';';
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users'],
    engineVersion: 15
  });

  // On PG 15 constant default does not rewrite table, but lacks lock_timeout
  assert.equal(report.severity, 'CAUTION');
  assert.equal(report.exitCode, 1);
  const hazard = report.hazards.find(h => h.code === 'MISSING_LOCK_TIMEOUT');
  assert.ok(hazard, 'Must flag MISSING_LOCK_TIMEOUT');
});

test('7. ALTER COLUMN TYPE narrowing triggers BLOCKING', () => {
  const catalog = {
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'bio', dataType: 'varchar(255)', nullable: true }
        ]
      }
    ]
  };
  const sql = 'ALTER TABLE customers ALTER COLUMN bio TYPE varchar(50);';
  const report = analyzeMigrationSafety(sql, {
    catalog,
    engineVersion: 15
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'ALTER_COL_TYPE_NARROWING');
  assert.ok(hazard, 'Must flag ALTER_COL_TYPE_NARROWING');
});

test('8. DROP TABLE and DROP COLUMN trigger destructive hazard', () => {
  const sql = `
    ALTER TABLE users DROP COLUMN legacy_field;
    DROP TABLE old_audit_log;
  `;
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['users', 'old_audit_log']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazards = report.hazards.filter(h => h.code === 'DROP_DESTRUCTIVE');
  assert.equal(hazards.length, 2);
});

test('9. ADD CONSTRAINT FOREIGN KEY without NOT VALID triggers BLOCKING', () => {
  const sql = 'ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);';
  const report = analyzeMigrationSafety(sql, {
    existingTables: ['orders', 'users']
  });

  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
  const hazard = report.hazards.find(h => h.code === 'FK_WITHOUT_NOT_VALID');
  assert.ok(hazard, 'Must flag FK_WITHOUT_NOT_VALID');
});

test('10. PL/pgSQL dollar-quoted procedure body does not trigger false positives', () => {
  const sql = `
    CREATE OR REPLACE FUNCTION audit_trigger() RETURNS trigger AS $func$
    BEGIN
      -- Inside function body, ALTER or DROP mentions must not be evaluated as migration DDL
      RAISE NOTICE 'Trigger executed on %', TG_TABLE_NAME;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  `;
  const report = analyzeMigrationSafety(sql);

  assert.equal(report.severity, 'SAFE');
  assert.equal(report.exitCode, 0);
  assert.equal(report.hazards.length, 0);
});

test('11. Canonical type kernel normalizes PostgreSQL synonyms', () => {
  assert.equal(canonicalizePgTypeKernel('int4'), 'integer');
  assert.equal(canonicalizePgTypeKernel('int8'), 'bigint');
  assert.equal(canonicalizePgTypeKernel('bool'), 'boolean');
  assert.equal(canonicalizePgTypeKernel('character varying(120)'), 'varchar(120)');
  assert.equal(canonicalizePgTypeKernel('float8'), 'double precision');
});

test('12. compareSchemaCatalogs detects missing and modified schema objects', () => {
  const expectedCatalog = {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', dataType: 'bigint', nullable: false },
          { name: 'email', dataType: 'varchar(255)', nullable: false },
          { name: 'score', dataType: 'integer', nullable: true }
        ],
        indexes: [
          { name: 'idx_users_email', columns: ['email'], unique: true }
        ]
      },
      {
        name: 'sessions',
        columns: [
          { name: 'token', dataType: 'text', nullable: false }
        ]
      }
    ]
  };

  const actualCatalog = {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', dataType: 'bigint', nullable: false },
          { name: 'email', dataType: 'varchar(100)', nullable: false } // type drifted
          // score column missing
        ],
        indexes: [] // idx_users_email missing
      }
      // sessions table missing
    ]
  };

  const drift = compareSchemaCatalogs(expectedCatalog, actualCatalog);
  assert.equal(drift.hasDrift, true);
  assert.equal(drift.severity, 'BLOCKING');
  assert.equal(drift.exitCode, 2);

  const missingTable = drift.items.find(i => i.kind === 'MISSING_TABLE');
  assert.ok(missingTable, 'Must detect missing sessions table');

  const missingCol = drift.items.find(i => i.kind === 'MISSING_COLUMN');
  assert.ok(missingCol, 'Must detect missing score column');

  const typeDrift = drift.items.find(i => i.kind === 'COLUMN_TYPE_DRIFT');
  assert.ok(typeDrift, 'Must detect email type drift');
});

test('13. runPreflightCheck combines migration safety and catalog drift checks', () => {
  const expected = {
    tables: [{ name: 'users', columns: [{ name: 'id', dataType: 'integer' }] }]
  };
  const actual = {
    tables: [{ name: 'users', columns: [{ name: 'id', dataType: 'integer' }] }]
  };

  // Safe migration + clean catalog
  const cleanResult = runPreflightCheck({
    migrations: 'CREATE TABLE logs (id serial, message text);',
    expectedSchema: expected,
    actualSchema: actual,
    engineVersion: 15
  });

  assert.equal(cleanResult.severity, 'SAFE');
  assert.equal(cleanResult.exitCode, 0);

  // Hazardous migration
  const hazardResult = runPreflightCheck({
    migrations: 'ALTER TABLE users ADD COLUMN phone text NOT NULL;',
    expectedSchema: expected,
    actualSchema: actual,
    engineVersion: 15
  });

  assert.equal(hazardResult.severity, 'BLOCKING');
  assert.equal(hazardResult.exitCode, 2);
});

test('14. CLI execute subcommands and returns appropriate exit codes', async () => {
  const output: string[] = [];
  const io = {
    stdout: (s: string) => output.push(s),
    stderr: (s: string) => output.push(`ERR: ${s}`)
  };

  const code1 = await runCli(['--help'], io);
  assert.equal(code1, 0);
  assert.ok(output.some(l => l.includes('Usage: drift-sentinel')));

  output.length = 0;
  const code2 = await runCli(['check-sql', 'CREATE TABLE test_tbl (id int);'], io);
  assert.equal(code2, 0);
  assert.ok(output.some(l => l.includes('SAFE')));
});
