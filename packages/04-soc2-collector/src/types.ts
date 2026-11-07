export type ControlFramework = 'SOC2' | 'ISO27001';

export type ControlStatus = 'PASS' | 'PARTIAL' | 'FAIL';

export interface IamPolicyStatement {
  effect: 'Allow' | 'Deny';
  actions: string | string[];
  resources: string | string[];
}

export interface IamPolicyDocument {
  policyName: string;
  statements: IamPolicyStatement[];
}

export interface RawIamAccessKey {
  keyId: string;
  status: 'ACTIVE' | 'INACTIVE';
  ageDays: number;
  createdAt?: string;
}

export interface RawIamUser {
  username: string;
  consolePasswordEnabled: boolean;
  mfaEnabled: boolean;
  accessKeys: RawIamAccessKey[];
  attachedPolicies?: IamPolicyDocument[];
  inlinePolicies?: IamPolicyDocument[];
}

export interface RawCloudIamSnapshot {
  kind?: 'RAW_IAM';
  provider: 'AWS' | 'GCP' | 'AZURE';
  accountId: string;
  collectedAt: string;
  maxAccessKeyAgeDays?: number;
  rootAccount: {
    mfaEnabled: boolean;
    activeAccessKeys: number;
  };
  users: RawIamUser[];
  standalonePolicies?: IamPolicyDocument[];
}

export interface NormalizedIamEvidence {
  kind: 'NORMALIZED_IAM';
  provider: string;
  accountId: string;
  collectedAt: string;
  rootMfaEnabled: boolean;
  rootActiveAccessKeys: number;
  totalConsoleUsers: number;
  humanUsersWithoutMfa: string[];
  staleAccessKeys: Array<{
    username: string;
    keyId: string;
    ageDays: number;
  }>;
  wildcardPolicies: Array<{
    principal: string;
    policyName: string;
  }>;
}

export interface RawEndpointDevice {
  deviceId: string;
  hostname: string;
  ownerEmail: string;
  osType: 'MACOS' | 'WINDOWS' | 'LINUX';
  diskEncrypted: boolean;
  encryptionType?: 'FILEVAULT' | 'BITLOCKER' | 'LUKS' | 'NONE';
  screenLockTimeoutMinutes: number | null;
  osPatchLagDays: number;
  hoursSinceLastCheckin: number;
}

export interface RawEndpointFleetSnapshot {
  kind?: 'RAW_MDM';
  mdmVendor: 'JAMF' | 'KANDJI' | 'INTUNE' | 'FLEETDM';
  collectedAt: string;
  maxScreenLockMinutes?: number;
  maxPatchLagDays?: number;
  maxCheckinStalenessHours?: number;
  devices: RawEndpointDevice[];
}

export interface NormalizedEndpointEvidence {
  kind: 'NORMALIZED_MDM';
  mdmVendor: string;
  collectedAt: string;
  totalDevices: number;
  unencryptedDevices: string[];
  screenLockCriticalDevices: string[];
  screenLockWarningDevices: string[];
  outdatedPatchDevices: string[];
  staleCheckinDevices: string[];
}

export interface RawDatastoreBackup {
  resourceId: string;
  engine: 'RDS_POSTGRES' | 'RDS_MYSQL' | 'AURORA' | 'EBS_VOLUME' | 'CLOUD_SQL' | 'DYNAMODB';
  latestSnapshotAgeHours: number | null;
  snapshotEncrypted: boolean;
  retentionDays: number;
  pointInTimeRecoveryEnabled?: boolean;
}

export interface RawRepositoryGovernance {
  repoName: string;
  defaultBranch: string;
  branchProtectionEnabled: boolean;
  requiredApprovingReviewCount: number;
  dismissStaleReviews: boolean;
  statusChecksRequired: boolean;
  directPushBlocked: boolean;
}

export interface RawBackupAndChangeSnapshot {
  kind?: 'RAW_BACKUP_CHANGE';
  collectedAt: string;
  rpoTargetHours?: number;
  minRetentionDays?: number;
  datastores: RawDatastoreBackup[];
  repositories: RawRepositoryGovernance[];
}

export interface NormalizedBackupChangeEvidence {
  kind: 'NORMALIZED_BACKUP_CHANGE';
  collectedAt: string;
  totalDatastores: number;
  rpoBreachDatastores: string[];
  unencryptedBackupDatastores: string[];
  shortRetentionDatastores: string[];
  criticalRetentionDatastores: string[];
  totalRepositories: number;
  unprotectedRepositories: string[];
  missingPrReviewRepositories: string[];
  weakGovernanceRepositories: string[];
}

export interface NormalizedTelemetryBundle {
  organizationName: string;
  evaluatedAt: string;
  previousChainHash?: string;
  iam: NormalizedIamEvidence;
  endpoints: NormalizedEndpointEvidence;
  backupAndChange: NormalizedBackupChangeEvidence;
}

export interface AuditTelemetryInput {
  organizationName: string;
  evaluatedAt?: string;
  previousChainHash?: string;
  iam: RawCloudIamSnapshot | NormalizedIamEvidence;
  endpoints: RawEndpointFleetSnapshot | NormalizedEndpointEvidence;
  backupAndChange: RawBackupAndChangeSnapshot | NormalizedBackupChangeEvidence;
}

export interface ControlEvaluation {
  framework: ControlFramework;
  controlId: string;
  title: string;
  status: ControlStatus;
  score: number;
  deficitCodes: string[];
  failingAssets: string[];
  remediationSummary: string;
}

export interface CompliancePostureReport {
  organizationName: string;
  evaluatedAt: string;
  overallStatus: ControlStatus;
  readinessScore: number;
  soc2Score: number;
  iso27001Score: number;
  controls: ControlEvaluation[];
  evidenceDigest: string;
  chainSealHash: string;
}

export type VaultArtifactType =
  | 'IAM_SNAPSHOT'
  | 'MDM_SNAPSHOT'
  | 'BACKUP_CHANGE_SNAPSHOT'
  | 'POSTURE_REPORT'
  | 'CUSTOM_EVIDENCE';

export interface VaultManifestEntry {
  sequence: number;
  artifactId: string;
  artifactType: VaultArtifactType;
  objectKey: string;
  capturedAt: string;
  plaintextSha256: string;
  ciphertextSha256: string;
  byteLength: number;
  prevChainHash: string;
  entryHash: string;
}

export interface VaultManifestDocument {
  version: '1.0';
  prefix: string;
  genesisHash: string;
  entries: VaultManifestEntry[];
}

export interface VaultIntegrityResult {
  valid: boolean;
  checkedEntries: number;
  headChainHash: string;
  failures: Array<{
    sequence?: number;
    artifactId?: string;
    code:
      | 'MANIFEST_MISSING_OR_CORRUPT'
      | 'SEQUENCE_GAP'
      | 'CHAIN_LINK_BROKEN'
      | 'ENTRY_HASH_MISMATCH'
      | 'OBJECT_MISSING'
      | 'CIPHERTEXT_HASH_MISMATCH'
      | 'GCM_AUTH_OR_DECRYPT_FAILED'
      | 'PLAINTEXT_HASH_MISMATCH'
      | 'UNTRACKED_ORPHAN_OBJECT';
    detail: string;
  }>;
}

export interface AuditCollectionRunOptions {
  vaultRoot: string;
  masterKey: string | Uint8Array;
  prefix?: string;
  binderOutputPath?: string;
}

export interface AuditCollectionRunResult {
  report: CompliancePostureReport;
  manifestEntries: VaultManifestEntry[];
  integrity: VaultIntegrityResult;
  binderPdfBytes: Uint8Array;
}
