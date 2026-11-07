import { mkdirSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { evaluateKernelPosture } from './core/kernel.ts';
import {
  normalizeBackupAndChangeSnapshot,
  normalizeEndpointSnapshot,
  normalizeIamSnapshot,
  normalizeTelemetryBundle
} from './adapters/collectors.ts';
import { VaultStore, verifyVaultIntegrity } from './adapters/vault.ts';
import { generateAuditBinderPdf } from './adapters/pdf-binder.ts';
import type {
  AuditCollectionRunOptions,
  AuditCollectionRunResult,
  AuditTelemetryInput,
  CompliancePostureReport
} from './types.ts';

export type {
  AuditCollectionRunOptions,
  AuditCollectionRunResult,
  AuditTelemetryInput,
  CompliancePostureReport,
  ControlEvaluation,
  ControlFramework,
  ControlStatus,
  IamPolicyDocument,
  IamPolicyStatement,
  NormalizedBackupChangeEvidence,
  NormalizedEndpointEvidence,
  NormalizedIamEvidence,
  NormalizedTelemetryBundle,
  RawBackupAndChangeSnapshot,
  RawCloudIamSnapshot,
  RawDatastoreBackup,
  RawEndpointDevice,
  RawEndpointFleetSnapshot,
  RawIamAccessKey,
  RawIamUser,
  RawRepositoryGovernance,
  VaultArtifactType,
  VaultIntegrityResult,
  VaultManifestDocument,
  VaultManifestEntry
} from './types.ts';

export {
  normalizeBackupAndChangeSnapshot,
  normalizeEndpointSnapshot,
  normalizeIamSnapshot,
  normalizeTelemetryBundle
} from './adapters/collectors.ts';

export { VaultStore, verifyVaultIntegrity } from './adapters/vault.ts';
export { generateAuditBinderPdf } from './adapters/pdf-binder.ts';

export function evaluateCompliancePosture(input: AuditTelemetryInput): CompliancePostureReport {
  const normalized = normalizeTelemetryBundle(input);
  return evaluateKernelPosture(normalized);
}

export function runAuditCollection(
  input: AuditTelemetryInput,
  options: AuditCollectionRunOptions
): AuditCollectionRunResult {
  const vault = new VaultStore({
    vaultRoot: options.vaultRoot,
    masterKey: options.masterKey,
    prefix: options.prefix ?? 'evidence'
  });

  const normalized = normalizeTelemetryBundle(input);
  const capturedAt = normalized.evaluatedAt;

  vault.putArtifact({
    artifactId: '01-cloud-iam',
    artifactType: 'IAM_SNAPSHOT',
    capturedAt,
    data: input.iam
  });

  vault.putArtifact({
    artifactId: '02-endpoint-mdm',
    artifactType: 'MDM_SNAPSHOT',
    capturedAt,
    data: input.endpoints
  });

  const bkpEntry = vault.putArtifact({
    artifactId: '03-backup-change',
    artifactType: 'BACKUP_CHANGE_SNAPSHOT',
    capturedAt,
    data: input.backupAndChange
  });

  const report = evaluateKernelPosture({
    ...normalized,
    previousChainHash: bkpEntry.entryHash
  });

  vault.putArtifact({
    artifactId: '04-posture-report',
    artifactType: 'POSTURE_REPORT',
    capturedAt,
    data: report
  });

  const manifestEntries = vault.listEntries();
  const integrity = vault.verifyIntegrity();
  const binderPdfBytes = generateAuditBinderPdf(report, manifestEntries);

  if (options.binderOutputPath) {
    const outAbs = path.resolve(options.binderOutputPath);
    mkdirSync(path.dirname(outAbs), { recursive: true });
    writeFileSync(outAbs, binderPdfBytes);
  }

  return {
    report,
    manifestEntries,
    integrity,
    binderPdfBytes
  };
}
