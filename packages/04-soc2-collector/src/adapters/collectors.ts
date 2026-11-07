import { isWildcardStatement, normalizeThresholds } from '../core/kernel.ts';
import type {
  AuditTelemetryInput,
  IamPolicyDocument,
  NormalizedBackupChangeEvidence,
  NormalizedEndpointEvidence,
  NormalizedIamEvidence,
  NormalizedTelemetryBundle,
  RawBackupAndChangeSnapshot,
  RawCloudIamSnapshot,
  RawEndpointFleetSnapshot
} from '../types.ts';

function toArray(val: string | string[]): string[] {
  return Array.isArray(val) ? val : [val];
}

function policyGrantsWildcard(doc: IamPolicyDocument): boolean {
  for (const stmt of doc.statements) {
    if (isWildcardStatement(stmt.effect, toArray(stmt.actions), toArray(stmt.resources))) {
      return true;
    }
  }
  return false;
}

export function normalizeIamSnapshot(
  snapshot: RawCloudIamSnapshot | NormalizedIamEvidence
): NormalizedIamEvidence {
  if (snapshot.kind === 'NORMALIZED_IAM') {
    return snapshot;
  }

  const thr = normalizeThresholds({ keyDays: snapshot.maxAccessKeyAgeDays });
  const maxKeyAgeDays = thr[0];

  const humanUsersWithoutMfa: string[] = [];
  const staleAccessKeys: NormalizedIamEvidence['staleAccessKeys'] = [];
  const wildcardPolicies: NormalizedIamEvidence['wildcardPolicies'] = [];
  let totalConsoleUsers = 0;

  for (const user of snapshot.users) {
    if (user.consolePasswordEnabled) {
      totalConsoleUsers++;
      if (!user.mfaEnabled) {
        humanUsersWithoutMfa.push(user.username);
      }
    }

    for (const key of user.accessKeys) {
      if (key.status === 'ACTIVE' && key.ageDays > maxKeyAgeDays) {
        staleAccessKeys.push({
          username: user.username,
          keyId: key.keyId,
          ageDays: key.ageDays
        });
      }
    }

    for (const pol of [...(user.attachedPolicies ?? []), ...(user.inlinePolicies ?? [])]) {
      if (policyGrantsWildcard(pol)) {
        wildcardPolicies.push({
          principal: user.username,
          policyName: pol.policyName
        });
      }
    }
  }

  for (const pol of snapshot.standalonePolicies ?? []) {
    if (policyGrantsWildcard(pol)) {
      wildcardPolicies.push({
        principal: snapshot.accountId,
        policyName: pol.policyName
      });
    }
  }

  return {
    kind: 'NORMALIZED_IAM',
    provider: snapshot.provider,
    accountId: snapshot.accountId,
    collectedAt: snapshot.collectedAt,
    rootMfaEnabled: snapshot.rootAccount.mfaEnabled,
    rootActiveAccessKeys: snapshot.rootAccount.activeAccessKeys,
    totalConsoleUsers,
    humanUsersWithoutMfa,
    staleAccessKeys,
    wildcardPolicies
  };
}

export function normalizeEndpointSnapshot(
  snapshot: RawEndpointFleetSnapshot | NormalizedEndpointEvidence
): NormalizedEndpointEvidence {
  if (snapshot.kind === 'NORMALIZED_MDM') {
    return snapshot;
  }

  const thr = normalizeThresholds({
    lockMin: snapshot.maxScreenLockMinutes,
    patchDays: snapshot.maxPatchLagDays,
    checkinHrs: snapshot.maxCheckinStalenessHours
  });
  const lockWarnLimit = thr[1];
  const lockCritLimit = thr[2];
  const maxPatchLagDays = thr[3];
  const maxCheckinHours = thr[4];

  const unencryptedDevices: string[] = [];
  const screenLockCriticalDevices: string[] = [];
  const screenLockWarningDevices: string[] = [];
  const outdatedPatchDevices: string[] = [];
  const staleCheckinDevices: string[] = [];

  for (const dev of snapshot.devices) {
    const label = `${dev.deviceId}(${dev.hostname})`;
    if (!dev.diskEncrypted || dev.encryptionType === 'NONE') {
      unencryptedDevices.push(label);
    }

    if (
      dev.screenLockTimeoutMinutes === null ||
      dev.screenLockTimeoutMinutes <= 0 ||
      dev.screenLockTimeoutMinutes > lockCritLimit
    ) {
      screenLockCriticalDevices.push(label);
    } else if (dev.screenLockTimeoutMinutes > lockWarnLimit) {
      screenLockWarningDevices.push(label);
    }

    if (dev.osPatchLagDays > maxPatchLagDays) {
      outdatedPatchDevices.push(label);
    }

    if (dev.hoursSinceLastCheckin > maxCheckinHours) {
      staleCheckinDevices.push(label);
    }
  }

  return {
    kind: 'NORMALIZED_MDM',
    mdmVendor: snapshot.mdmVendor,
    collectedAt: snapshot.collectedAt,
    totalDevices: snapshot.devices.length,
    unencryptedDevices,
    screenLockCriticalDevices,
    screenLockWarningDevices,
    outdatedPatchDevices,
    staleCheckinDevices
  };
}

export function normalizeBackupAndChangeSnapshot(
  snapshot: RawBackupAndChangeSnapshot | NormalizedBackupChangeEvidence
): NormalizedBackupChangeEvidence {
  if (snapshot.kind === 'NORMALIZED_BACKUP_CHANGE') {
    return snapshot;
  }

  const thr = normalizeThresholds({
    rpoHrs: snapshot.rpoTargetHours,
    retDays: snapshot.minRetentionDays
  });
  const rpoHours = thr[5];
  const minRetentionDays = thr[6];
  const critRetentionDays = thr[7];
  const minPrReviews = thr[8];

  const rpoBreachDatastores: string[] = [];
  const unencryptedBackupDatastores: string[] = [];
  const shortRetentionDatastores: string[] = [];
  const criticalRetentionDatastores: string[] = [];

  for (const ds of snapshot.datastores) {
    if (ds.latestSnapshotAgeHours === null || ds.latestSnapshotAgeHours > rpoHours) {
      rpoBreachDatastores.push(ds.resourceId);
    }
    if (!ds.snapshotEncrypted) {
      unencryptedBackupDatastores.push(ds.resourceId);
    }
    if (ds.retentionDays < critRetentionDays) {
      criticalRetentionDatastores.push(ds.resourceId);
    } else if (ds.retentionDays < minRetentionDays) {
      shortRetentionDatastores.push(ds.resourceId);
    }
  }

  const unprotectedRepositories: string[] = [];
  const missingPrReviewRepositories: string[] = [];
  const weakGovernanceRepositories: string[] = [];

  for (const repo of snapshot.repositories) {
    if (!repo.branchProtectionEnabled || !repo.directPushBlocked) {
      unprotectedRepositories.push(repo.repoName);
    }
    if (repo.requiredApprovingReviewCount < minPrReviews) {
      missingPrReviewRepositories.push(repo.repoName);
    }
    if (
      repo.branchProtectionEnabled &&
      repo.directPushBlocked &&
      repo.requiredApprovingReviewCount >= minPrReviews &&
      (!repo.dismissStaleReviews || !repo.statusChecksRequired)
    ) {
      weakGovernanceRepositories.push(repo.repoName);
    }
  }

  return {
    kind: 'NORMALIZED_BACKUP_CHANGE',
    collectedAt: snapshot.collectedAt,
    totalDatastores: snapshot.datastores.length,
    rpoBreachDatastores,
    unencryptedBackupDatastores,
    shortRetentionDatastores,
    criticalRetentionDatastores,
    totalRepositories: snapshot.repositories.length,
    unprotectedRepositories,
    missingPrReviewRepositories,
    weakGovernanceRepositories
  };
}

export function normalizeTelemetryBundle(input: AuditTelemetryInput): NormalizedTelemetryBundle {
  const iam = normalizeIamSnapshot(input.iam);
  const endpoints = normalizeEndpointSnapshot(input.endpoints);
  const backupAndChange = normalizeBackupAndChangeSnapshot(input.backupAndChange);

  const evaluatedAt =
    input.evaluatedAt ?? iam.collectedAt ?? endpoints.collectedAt ?? backupAndChange.collectedAt;

  return {
    organizationName: input.organizationName,
    evaluatedAt,
    previousChainHash: input.previousChainHash,
    iam,
    endpoints,
    backupAndChange
  };
}
