import test from 'node:test';
import assert from 'node:assert/strict';

test('01-matrix-pruner dist execution equivalence', async () => {
  const mod = await import('../packages/01-matrix-pruner/dist/index.mjs');
  assert.equal(typeof mod.planMatrixExecution, 'function');
  assert.equal(typeof mod.detectZombieRuns, 'function');
  assert.equal(typeof mod.computeSavingsInvoice, 'function');

  const invoice = mod.computeSavingsInvoice({
    month: '2026-11',
    activeContributors: 8,
    events: [
      {
        provider: 'github',
        os: 'linux',
        arch: 'x64',
        savedMinutes: 50
      }
    ]
  });
  assert.equal(invoice.tier, 'starter');
  assert.ok(invoice.grossComputeSavedUsd > 0);
  assert.ok(invoice.effectiveFeeUsd > 0);
});

test('02-drift-sentinel dist execution equivalence', async () => {
  const mod = await import('../packages/02-drift-sentinel/dist/index.mjs');
  assert.equal(typeof mod.analyzeMigrationSafety, 'function');
  assert.equal(typeof mod.compareSchemaCatalogs, 'function');
  assert.equal(typeof mod.canonicalizePgTypeKernel, 'function');

  assert.equal(mod.canonicalizePgTypeKernel('int8'), 'bigint');

  const report = mod.analyzeMigrationSafety('CREATE INDEX idx_users_email ON users (email);', {
    existingTables: ['users']
  });
  assert.equal(report.severity, 'BLOCKING');
  assert.equal(report.exitCode, 2);
});

test('03-clinic-preauth dist execution equivalence', async () => {
  const mod = await import('../packages/03-clinic-preauth/dist/index.mjs');
  assert.equal(typeof mod.validateNpiLuhn, 'function');
  assert.equal(typeof mod.buildX12Eligibility270, 'function');
  assert.equal(typeof mod.parseX12Eligibility271, 'function');

  const res = mod.validateNpiLuhn('1234567893');
  assert.equal(res, true);
});

test('04-soc2-collector dist execution equivalence', async () => {
  const mod = await import('../packages/04-soc2-collector/dist/index.mjs');
  assert.equal(typeof mod.evaluateCompliancePosture, 'function');
  assert.equal(typeof mod.generateAuditBinderPdf, 'function');

  const report = mod.evaluateCompliancePosture({
    organizationName: 'Acme Security Corp',
    evaluatedAt: '2026-11-04T12:00:00.000Z',
    iam: {
      provider: 'AWS',
      accountId: '123456789012',
      collectedAt: '2026-11-04T11:55:00.000Z',
      rootAccount: {
        mfaEnabled: true,
        activeAccessKeys: 0
      },
      users: [
        {
          username: 'alice@acme.com',
          consolePasswordEnabled: true,
          mfaEnabled: true,
          accessKeys: [{ keyId: 'AKIA1111111111111111', status: 'ACTIVE', ageDays: 30 }] // repo-guard: allow, a made-up key in a test fixture
        }
      ]
    },
    endpoints: {
      provider: 'MDM',
      devices: []
    },
    backupAndChange: {
      provider: 'AWS_GITHUB',
      datastores: [],
      repositories: []
    }
  });
  assert.equal(report.overallStatus, 'PASS');
  assert.equal(report.readinessScore, 100);
});

test('05-stock-sentinel dist execution equivalence', async () => {
  const mod = await import('../packages/05-stock-sentinel/dist/index.mjs');
  assert.equal(typeof mod.extractStorefrontSnapshot, 'function');
  assert.equal(typeof mod.evaluateStockTransition, 'function');

  const snap = mod.extractStorefrontSnapshot({
    url: 'https://store.example.com/products.json',
    body: JSON.stringify({
      products: [
        {
          id: 101,
          title: 'Mechanical Keycap',
          variants: [{ id: 201, title: 'Default', price: '45.00', available: true }]
        }
      ]
    })
  });
  assert.equal(snap.ok, true);
  assert.equal(snap.snapshots.length, 1);
  assert.equal(snap.snapshots[0].variants[0].priceCents, 4500);
});

test('06-local-redactor dist execution equivalence', async () => {
  const mod = await import('../packages/06-local-redactor/dist/index.mjs');
  assert.equal(typeof mod.redactText, 'function');
  assert.equal(typeof mod.redactPdfBuffer, 'function');

  const textRes = mod.redactText('User SSN: 123-45-6789 and email john@example.com');
  assert.ok(!textRes.redactedText.includes('123-45-6789'));
  assert.ok(!textRes.redactedText.includes('john@example.com'));
});
