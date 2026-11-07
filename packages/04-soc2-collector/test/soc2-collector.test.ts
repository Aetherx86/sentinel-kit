import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  evaluateCompliancePosture,
  generateAuditBinderPdf,
  runAuditCollection,
  VaultStore,
  verifyVaultIntegrity
} from '../src/index.ts';
import { runCli } from '../src/cli.ts';
import type { AuditTelemetryInput } from '../src/types.ts';

function createCleanTelemetry(overrides?: Partial<AuditTelemetryInput>): AuditTelemetryInput {
  return {
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
        },
        {
          username: 'bob@acme.com',
          consolePasswordEnabled: true,
          mfaEnabled: true,
          accessKeys: [{ keyId: 'AKIA2222222222222222', status: 'ACTIVE', ageDays: 45 }] // repo-guard: allow, a made-up key in a test fixture
        }
      ],
      standalonePolicies: [
        {
          policyName: 'ReadOnlyEngineers',
          statements: [{ effect: 'Allow', actions: ['s3:GetObject'], resources: ['arn:aws:s3:::audit-*'] }]
        }
      ]
    },
    endpoints: {
      mdmVendor: 'FLEETDM',
      collectedAt: '2026-11-04T11:50:00.000Z',
      devices: [
        {
          deviceId: 'dev-001',
          hostname: 'alice-laptop.local',
          ownerEmail: 'alice@acme.com',
          osType: 'MACOS',
          diskEncrypted: true,
          encryptionType: 'FILEVAULT',
          screenLockTimeoutMinutes: 5,
          osPatchLagDays: 2,
          hoursSinceLastCheckin: 1
        },
        {
          deviceId: 'dev-002',
          hostname: 'bob-workstation.local',
          ownerEmail: 'bob@acme.com',
          osType: 'LINUX',
          diskEncrypted: true,
          encryptionType: 'LUKS',
          screenLockTimeoutMinutes: 10,
          osPatchLagDays: 4,
          hoursSinceLastCheckin: 2
        }
      ]
    },
    backupAndChange: {
      collectedAt: '2026-11-04T11:45:00.000Z',
      datastores: [
        {
          resourceId: 'prod-postgres-primary',
          engine: 'RDS_POSTGRES',
          latestSnapshotAgeHours: 4,
          snapshotEncrypted: true,
          retentionDays: 35,
          pointInTimeRecoveryEnabled: true
        }
      ],
      repositories: [
        {
          repoName: 'acme/core-api',
          defaultBranch: 'main',
          branchProtectionEnabled: true,
          requiredApprovingReviewCount: 1,
          dismissStaleReviews: true,
          statusChecksRequired: true,
          directPushBlocked: true
        }
      ]
    },
    ...overrides
  };
}

describe('04-soc2-collector', () => {
  it('1. evaluates fully compliant posture with 100% readiness score and PASS across all controls', () => {
    const input = createCleanTelemetry();
    const report = evaluateCompliancePosture(input);

    assert.equal(report.overallStatus, 'PASS');
    assert.equal(report.readinessScore, 100);
    assert.equal(report.soc2Score, 100);
    assert.equal(report.iso27001Score, 100);
    assert.ok(report.controls.length >= 10);
    for (const c of report.controls) {
      assert.equal(c.status, 'PASS', `Control ${c.controlId} expected PASS but got ${c.status}`);
      assert.equal(c.score, 100);
      assert.equal(c.failingAssets.length, 0);
    }
    assert.ok(report.chainSealHash.length === 64);
  });

  it('2. detects missing root MFA as high-severity failure on CC6.1 and A.5.15', () => {
    const input = createCleanTelemetry({
      iam: {
        provider: 'AWS',
        accountId: '123456789012',
        collectedAt: '2026-11-04T11:55:00.000Z',
        rootAccount: { mfaEnabled: false, activeAccessKeys: 0 },
        users: []
      }
    });
    const report = evaluateCompliancePosture(input);
    assert.notEqual(report.overallStatus, 'PASS');

    const cc61 = report.controls.find((c) => c.controlId === 'CC6.1');
    assert.ok(cc61 !== undefined);
    assert.equal(cc61?.status, 'FAIL');
    assert.ok(cc61?.deficitCodes.includes('IAM_ROOT_MFA_DISABLED'));
    assert.ok(cc61?.failingAssets.includes('iam:root'));

    const a515 = report.controls.find((c) => c.controlId === 'A.5.15');
    assert.ok(a515 !== undefined);
    assert.equal(a515?.status, 'FAIL');
  });

  it('3. detects active root access keys as high-risk deficit on CC6.1 and A.5.15', () => {
    const input = createCleanTelemetry({
      iam: {
        provider: 'AWS',
        accountId: '123456789012',
        collectedAt: '2026-11-04T11:55:00.000Z',
        rootAccount: { mfaEnabled: true, activeAccessKeys: 2 },
        users: []
      }
    });
    const report = evaluateCompliancePosture(input);
    const cc61 = report.controls.find((c) => c.controlId === 'CC6.1');
    assert.ok(cc61?.deficitCodes.includes('IAM_ROOT_ACCESS_KEY_ACTIVE'));
    assert.ok(cc61?.failingAssets.includes('iam:root'));
  });

  it('4. detects stale IAM user access keys (>90d) and human users without MFA', () => {
    const input = createCleanTelemetry();
    (input.iam as any).users.push({
      username: 'intern@acme.com',
      consolePasswordEnabled: true,
      mfaEnabled: false,
      accessKeys: [{ keyId: 'AKIA9999999999999999', status: 'ACTIVE', ageDays: 140 }] // repo-guard: allow, a made-up key in a test fixture
    });

    const report = evaluateCompliancePosture(input);
    const cc61 = report.controls.find((c) => c.controlId === 'CC6.1');
    assert.ok(cc61?.deficitCodes.includes('IAM_USER_MFA_MISSING'));
    assert.ok(cc61?.failingAssets.includes('iam:user:intern@acme.com'));

    const cc62 = report.controls.find((c) => c.controlId === 'CC6.2');
    assert.ok(cc62?.deficitCodes.includes('IAM_KEY_ROTATION_OVERDUE'));
  });

  it('5. detects overly permissive wildcard *:* IAM policies', () => {
    const input = createCleanTelemetry();
    (input.iam as any).users[0].attachedPolicies = [
      {
        policyName: 'FullAdminAccess',
        statements: [{ effect: 'Allow', actions: ['*'], resources: ['*'] }]
      }
    ];

    const report = evaluateCompliancePosture(input);
    const cc61 = report.controls.find((c) => c.controlId === 'CC6.1');
    assert.ok(cc61?.deficitCodes.includes('IAM_WILDCARD_POLICY'));
  });

  it('6. detects unencrypted endpoint laptops failing CC6.6 and A.8.1', () => {
    const input = createCleanTelemetry();
    (input.endpoints as any).devices.push({
      deviceId: 'dev-003',
      hostname: 'unencrypted-mac.local',
      ownerEmail: 'contractor@acme.com',
      osType: 'MACOS',
      diskEncrypted: false,
      encryptionType: 'NONE',
      screenLockTimeoutMinutes: 5,
      osPatchLagDays: 0,
      hoursSinceLastCheckin: 1
    });

    const report = evaluateCompliancePosture(input);
    const cc66 = report.controls.find((c) => c.controlId === 'CC6.6');
    assert.ok(cc66 !== undefined);
    assert.equal(cc66?.status, 'FAIL');
    assert.ok(cc66?.deficitCodes.includes('MDM_DISK_UNENCRYPTED'));
    assert.ok(cc66?.failingAssets.some((a) => a.includes('dev-003')));

    const a81 = report.controls.find((c) => c.controlId === 'A.8.1');
    assert.ok(a81 !== undefined);
    assert.equal(a81?.status, 'FAIL');
  });

  it('7. detects critical screen-lock timeouts (>15m) on endpoints', () => {
    const input = createCleanTelemetry();
    (input.endpoints as any).devices[0].screenLockTimeoutMinutes = 60;

    const report = evaluateCompliancePosture(input);
    const cc66 = report.controls.find((c) => c.controlId === 'CC6.6');
    assert.ok(cc66?.deficitCodes.includes('MDM_SCREENLOCK_CRITICAL'));
  });

  it('8. detects unencrypted datastore backups failing A1.2 and A.8.13', () => {
    const input = createCleanTelemetry();
    (input.backupAndChange as any).datastores[0].snapshotEncrypted = false;

    const report = evaluateCompliancePosture(input);
    const a12 = report.controls.find((c) => c.controlId === 'A1.2');
    assert.ok(a12 !== undefined);
    assert.equal(a12?.status, 'FAIL');
    assert.ok(a12?.deficitCodes.includes('BKP_SNAPSHOT_UNENCRYPTED'));
    assert.ok(a12?.failingAssets.includes('datastore:prod-postgres-primary'));

    const a813 = report.controls.find((c) => c.controlId === 'A.8.13');
    assert.ok(a813 !== undefined);
    assert.equal(a813?.status, 'FAIL');
  });

  it('9. detects RPO breach (>24h since snapshot) on mission-critical databases', () => {
    const input = createCleanTelemetry();
    (input.backupAndChange as any).datastores[0].latestSnapshotAgeHours = 48;

    const report = evaluateCompliancePosture(input);
    const a12 = report.controls.find((c) => c.controlId === 'A1.2');
    assert.ok(a12?.deficitCodes.includes('BKP_RPO_WINDOW_BREACHED'));
    assert.ok(a12?.failingAssets.includes('datastore:prod-postgres-primary'));
  });

  it('10. detects missing branch protection and PR review enforcement on default branch', () => {
    const input = createCleanTelemetry();
    (input.backupAndChange as any).repositories[0].branchProtectionEnabled = false;
    (input.backupAndChange as any).repositories[0].requiredApprovingReviewCount = 0;

    const report = evaluateCompliancePosture(input);
    const cc81 = report.controls.find((c) => c.controlId === 'CC8.1');
    assert.ok(cc81 !== undefined);
    assert.equal(cc81?.status, 'FAIL');
    assert.ok(cc81?.deficitCodes.includes('CHG_BRANCH_UNPROTECTED'));
    assert.ok(cc81?.failingAssets.includes('repo:acme/core-api'));

    const a824 = report.controls.find((c) => c.controlId === 'A.8.24');
    assert.ok(a824 !== undefined);
    assert.equal(a824?.status, 'PASS'); // Cryptography control remains pass
  });

  it('11. verifies AES-256-GCM vault round-trip encryption, decryption, and hash chaining', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'soc2-vault-test-'));
    try {
      const vault = new VaultStore({
        vaultRoot: tmpDir,
        masterKey: 'test-vault-secret-passphrase-32b',
        prefix: 'test-evidence'
      });

      const entry1 = vault.putArtifact({
        artifactId: 'snap-iam',
        artifactType: 'IAM_SNAPSHOT',
        capturedAt: '2026-11-04T10:00:00.000Z',
        data: { users: 5, mfa: true }
      });
      assert.equal(entry1.sequence, 0);
      assert.equal(entry1.prevChainHash, '0'.repeat(64));

      const entry2 = vault.putArtifact({
        artifactId: 'snap-mdm',
        artifactType: 'MDM_SNAPSHOT',
        capturedAt: '2026-11-04T10:05:00.000Z',
        data: { devices: 12 }
      });
      assert.equal(entry2.sequence, 1);
      assert.equal(entry2.prevChainHash, entry1.entryHash);

      const decrypted1 = JSON.parse(vault.getArtifact('snap-iam').toString('utf8'));
      assert.equal(decrypted1.users, 5);
      assert.equal(decrypted1.mfa, true);

      const integrity = vault.verifyIntegrity();
      assert.equal(integrity.valid, true);
      assert.equal(integrity.checkedEntries, 2);
      assert.equal(integrity.failures.length, 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('12. detects vault ciphertext tampering and broken hash chain', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'soc2-vault-tamper-'));
    try {
      const vault = new VaultStore({
        vaultRoot: tmpDir,
        masterKey: 'test-vault-secret-passphrase-32b'
      });

      vault.putArtifact({
        artifactId: 'snap-1',
        artifactType: 'IAM_SNAPSHOT',
        capturedAt: '2026-11-04T10:00:00.000Z',
        data: { secret: 'original' }
      });
      const entry2 = vault.putArtifact({
        artifactId: 'snap-2',
        artifactType: 'MDM_SNAPSHOT',
        capturedAt: '2026-11-04T10:05:00.000Z',
        data: { count: 42 }
      });

      // Tamper with ciphertext file
      const encPath = path.join(tmpDir, entry2.objectKey);
      fs.appendFileSync(encPath, 'tampered-byte');

      const integrity = vault.verifyIntegrity();
      assert.equal(integrity.valid, false);
      assert.ok(integrity.failures.some((f) => f.code === 'CIPHERTEXT_HASH_MISMATCH' || f.code === 'GCM_AUTH_OR_DECRYPT_FAILED'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('13. generates valid binary PDF 1.4 audit binder with exact xref offsets and control tables', () => {
    const input = createCleanTelemetry();
    const report = evaluateCompliancePosture(input);
    const pdfBytes = generateAuditBinderPdf(report, [
      {
        sequence: 0,
        artifactId: '01-cloud-iam',
        artifactType: 'IAM_SNAPSHOT',
        objectKey: 'evidence/2026/11/04/01-cloud-iam.enc',
        capturedAt: '2026-11-04T12:00:00.000Z',
        plaintextSha256: 'a'.repeat(64),
        ciphertextSha256: 'b'.repeat(64),
        byteLength: 2048,
        prevChainHash: '0'.repeat(64),
        entryHash: 'c'.repeat(64)
      }
    ]);

    assert.ok(pdfBytes instanceof Buffer);
    const latin = pdfBytes.toString('latin1');
    assert.ok(latin.startsWith('%PDF-1.4\n'));
    assert.ok(latin.endsWith('%%EOF\n'));

    // Verify xref table
    const startXrefMatch = /startxref\n(\d+)\n%%EOF/.exec(latin);
    assert.ok(startXrefMatch !== null);
    const xrefOffset = Number.parseInt(startXrefMatch[1], 10);
    assert.ok(latin.slice(xrefOffset).startsWith('xref\n'));

    // Verify content embeds
    assert.ok(latin.includes('SOC2 & ISO/IEC 27001:2022 AUDIT EVIDENCE BINDER'));
    assert.ok(latin.includes('Acme Security Corp'));
    assert.ok(latin.includes('CC6.1'));
    assert.ok(latin.includes('A.5.15'));
  });

  it('14. executes collect, verify-vault, and export-binder CLI commands cleanly', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'soc2-cli-test-'));
    try {
      const telemetryPath = path.join(tmpDir, 'telemetry.json');
      fs.writeFileSync(telemetryPath, JSON.stringify(createCleanTelemetry()));
      const vaultPath = path.join(tmpDir, 'vault');
      const pdfPath = path.join(tmpDir, 'binder.pdf');

      // 1. collect
      const outLines: string[] = [];
      const code1 = runCli(
        ['collect', '--input', telemetryPath, '--vault', vaultPath, '--key', 'top-secret-pass', '--pdf', pdfPath],
        { stdout: (s) => outLines.push(s) }
      );
      assert.equal(code1, 0);
      assert.ok(fs.existsSync(pdfPath));
      assert.ok(fs.statSync(pdfPath).size > 1000);

      // 2. verify-vault
      const verifyLines: string[] = [];
      const code2 = runCli(
        ['verify-vault', '--vault', vaultPath, '--key', 'top-secret-pass'],
        { stdout: (s) => verifyLines.push(s) }
      );
      assert.equal(code2, 0);
      const parsedVerify = JSON.parse(verifyLines.join(''));
      assert.equal(parsedVerify.valid, true);

      // 3. export-binder
      const exportPdf = path.join(tmpDir, 'exported.pdf');
      const code3 = runCli(
        ['export-binder', '--out', exportPdf, '--input', telemetryPath],
        { stdout: () => {} }
      );
      assert.equal(code3, 0);
      assert.ok(fs.existsSync(exportPdf));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
