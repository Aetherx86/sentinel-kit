import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import {
  computeChainEntryHash,
  getGenesisChainHash,
  openVaultEnvelope,
  sealVaultEnvelope
} from '../core/kernel.ts';
import type {
  VaultArtifactType,
  VaultIntegrityResult,
  VaultManifestDocument,
  VaultManifestEntry
} from '../types.ts';

function sanitizeSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function datePartitionFromIso(iso: string): { yyyy: string; mm: string; dd: string } {
  const dt = new Date(iso);
  const valid = Number.isNaN(dt.getTime()) ? new Date('2026-01-01T00:00:00Z') : dt;
  return {
    yyyy: String(valid.getUTCFullYear()).padStart(4, '0'),
    mm: String(valid.getUTCMonth() + 1).padStart(2, '0'),
    dd: String(valid.getUTCDate()).padStart(2, '0')
  };
}

function walkEncFiles(dir: string, rootDir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      walkEncFiles(abs, rootDir, out);
    } else if (st.isFile() && entry.endsWith('.enc')) {
      const rel = path.relative(rootDir, abs).split(path.sep).join('/');
      out.push(rel);
    }
  }
  return out;
}

export class VaultStore {
  private readonly vaultRoot: string;
  private readonly masterKey: string | Uint8Array;
  private readonly prefix: string;

  constructor(options: { vaultRoot: string; masterKey: string | Uint8Array; prefix?: string }) {
    this.vaultRoot = path.resolve(options.vaultRoot);
    this.masterKey = options.masterKey;
    this.prefix = sanitizeSegment(options.prefix ?? 'evidence');
  }

  public getManifestPath(): string {
    return path.join(this.vaultRoot, this.prefix, 'manifest.chain.json');
  }

  private loadOrCreateManifest(): VaultManifestDocument {
    const manifestPath = this.getManifestPath();
    if (!existsSync(manifestPath)) {
      return {
        version: '1.0',
        prefix: this.prefix,
        genesisHash: getGenesisChainHash(),
        entries: []
      };
    }
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as VaultManifestDocument;
  }

  private saveManifest(doc: VaultManifestDocument): void {
    const manifestPath = this.getManifestPath();
    mkdirSync(path.dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, JSON.stringify(doc, null, 2), 'utf8');
  }

  public listEntries(): VaultManifestEntry[] {
    return [...this.loadOrCreateManifest().entries];
  }

  public getHeadChainHash(): string {
    const entries = this.loadOrCreateManifest().entries;
    return entries.length > 0 ? entries[entries.length - 1].entryHash : getGenesisChainHash();
  }

  // Binary .enc layout: [0..3] 'SVLT' magic, [4] version=1, [5..20] 16B HKDF salt,
  // [21..32] 12B AES-GCM IV, [33..48] 16B GCM authTag, [49..N] ciphertext.
  public putArtifact(params: {
    artifactId: string;
    artifactType: VaultArtifactType;
    capturedAt: string;
    data: string | Uint8Array | object;
  }): VaultManifestEntry {
    const manifest = this.loadOrCreateManifest();
    const sequence = manifest.entries.length;
    const prevChainHash =
      sequence === 0 ? manifest.genesisHash : manifest.entries[sequence - 1].entryHash;

    const safeId = sanitizeSegment(params.artifactId);
    const { yyyy, mm, dd } = datePartitionFromIso(params.capturedAt);
    const objectKey = `${this.prefix}/${yyyy}/${mm}/${dd}/${safeId}.enc`;
    const objectAbsPath = path.join(this.vaultRoot, ...objectKey.split('/'));

    let plaintextBytes: Uint8Array;
    if (params.data instanceof Uint8Array) {
      plaintextBytes = params.data;
    } else if (typeof params.data === 'string') {
      plaintextBytes = Buffer.from(params.data, 'utf8');
    } else {
      plaintextBytes = Buffer.from(JSON.stringify(params.data, null, 2), 'utf8');
    }

    const sealed = sealVaultEnvelope(
      this.masterKey,
      objectKey,
      params.artifactType,
      params.capturedAt,
      plaintextBytes
    );

    mkdirSync(path.dirname(objectAbsPath), { recursive: true });
    writeFileSync(objectAbsPath, sealed.packet);

    const entryHash = computeChainEntryHash(
      sequence,
      safeId,
      params.artifactType,
      objectKey,
      params.capturedAt,
      sealed.plaintextSha256,
      sealed.ciphertextSha256,
      sealed.packet.length,
      prevChainHash
    );

    const entry: VaultManifestEntry = {
      sequence,
      artifactId: safeId,
      artifactType: params.artifactType,
      objectKey,
      capturedAt: params.capturedAt,
      plaintextSha256: sealed.plaintextSha256,
      ciphertextSha256: sealed.ciphertextSha256,
      byteLength: sealed.packet.length,
      prevChainHash,
      entryHash
    };

    manifest.entries.push(entry);
    this.saveManifest(manifest);
    return entry;
  }

  public getArtifact(artifactId: string): Buffer {
    const safeId = sanitizeSegment(artifactId);
    const manifest = this.loadOrCreateManifest();
    const entry = manifest.entries.find((e) => e.artifactId === safeId);
    if (!entry) {
      throw new Error(`Vault artifact "${safeId}" not found in manifest`);
    }

    const objectAbsPath = path.join(this.vaultRoot, ...entry.objectKey.split('/'));
    if (!existsSync(objectAbsPath)) {
      throw new Error(`Encrypted vault object missing on disk: ${entry.objectKey}`);
    }

    const packet = readFileSync(objectAbsPath);
    const actualCtHash = createHash('sha256').update(packet).digest('hex');
    if (actualCtHash !== entry.ciphertextSha256 || packet.length !== entry.byteLength) {
      throw new Error(`Vault ciphertext integrity mismatch for "${safeId}"`);
    }

    const opened = openVaultEnvelope(
      this.masterKey,
      entry.objectKey,
      entry.artifactType,
      entry.capturedAt,
      entry.plaintextSha256,
      packet
    );

    if (!opened.ok || !opened.plaintext) {
      throw new Error(`Vault AES-256-GCM authentication failed for "${safeId}"`);
    }

    return opened.plaintext;
  }

  public getJsonArtifact<T = unknown>(artifactId: string): T {
    return JSON.parse(this.getArtifact(artifactId).toString('utf8')) as T;
  }

  public verifyIntegrity(): VaultIntegrityResult {
    const manifestPath = this.getManifestPath();
    const genesis = getGenesisChainHash();

    if (!existsSync(manifestPath)) {
      return {
        valid: false,
        checkedEntries: 0,
        headChainHash: genesis,
        failures: [
          {
            code: 'MANIFEST_MISSING_OR_CORRUPT',
            detail: `Manifest file not found at ${manifestPath}`
          }
        ]
      };
    }

    let manifest: VaultManifestDocument;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as VaultManifestDocument;
    } catch (err) {
      return {
        valid: false,
        checkedEntries: 0,
        headChainHash: genesis,
        failures: [
          {
            code: 'MANIFEST_MISSING_OR_CORRUPT',
            detail: err instanceof Error ? err.message : 'Invalid JSON manifest'
          }
        ]
      };
    }

    const failures: VaultIntegrityResult['failures'] = [];
    let expectedPrev = manifest.genesisHash;
    if (manifest.genesisHash !== genesis) {
      failures.push({
        sequence: 0,
        code: 'CHAIN_LINK_BROKEN',
        detail: 'Manifest genesisHash does not match canonical vault genesis'
      });
    }

    const trackedKeys = new Set<string>();

    for (let idx = 0; idx < manifest.entries.length; idx++) {
      const entry = manifest.entries[idx];
      trackedKeys.add(entry.objectKey);

      if (entry.sequence !== idx) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: 'SEQUENCE_GAP',
          detail: `Expected sequence ${idx} but found ${entry.sequence}`
        });
      }

      if (entry.prevChainHash !== expectedPrev) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: 'CHAIN_LINK_BROKEN',
          detail: `Entry prevChainHash does not match predecessor entryHash at index ${idx}`
        });
      }

      const recomputedEntryHash = computeChainEntryHash(
        entry.sequence,
        entry.artifactId,
        entry.artifactType,
        entry.objectKey,
        entry.capturedAt,
        entry.plaintextSha256,
        entry.ciphertextSha256,
        entry.byteLength,
        entry.prevChainHash
      );
      if (recomputedEntryHash !== entry.entryHash) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: 'ENTRY_HASH_MISMATCH',
          detail: 'Manifest entry metadata was modified after sealing'
        });
      }

      expectedPrev = entry.entryHash;

      const objectAbsPath = path.join(this.vaultRoot, ...entry.objectKey.split('/'));
      if (!existsSync(objectAbsPath)) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: 'OBJECT_MISSING',
          detail: `Encrypted snapshot file missing: ${entry.objectKey}`
        });
        continue;
      }

      const packet = readFileSync(objectAbsPath);
      const actualCtHash = createHash('sha256').update(packet).digest('hex');
      if (actualCtHash !== entry.ciphertextSha256 || packet.length !== entry.byteLength) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: 'CIPHERTEXT_HASH_MISMATCH',
          detail: `Encrypted object hash or length tampered on disk: ${entry.objectKey}`
        });
      }

      const opened = openVaultEnvelope(
        this.masterKey,
        entry.objectKey,
        entry.artifactType,
        entry.capturedAt,
        entry.plaintextSha256,
        packet
      );
      if (!opened.ok) {
        failures.push({
          sequence: entry.sequence,
          artifactId: entry.artifactId,
          code: opened.code === 2 ? 'PLAINTEXT_HASH_MISMATCH' : 'GCM_AUTH_OR_DECRYPT_FAILED',
          detail: `AES-256-GCM decryption/authentication failed for ${entry.objectKey}`
        });
      }
    }

    const prefixDir = path.join(this.vaultRoot, this.prefix);
    const diskKeys = walkEncFiles(prefixDir, this.vaultRoot);
    for (const dk of diskKeys) {
      if (!trackedKeys.has(dk)) {
        failures.push({
          code: 'UNTRACKED_ORPHAN_OBJECT',
          detail: `Unmanifested encrypted object present in bucket: ${dk}`
        });
      }
    }

    const headChainHash =
      manifest.entries.length > 0
        ? manifest.entries[manifest.entries.length - 1].entryHash
        : genesis;

    return {
      valid: failures.length === 0,
      checkedEntries: manifest.entries.length,
      headChainHash,
      failures
    };
  }
}

export function verifyVaultIntegrity(
  vaultRoot: string,
  masterKey: string | Uint8Array,
  prefix = 'evidence'
): VaultIntegrityResult {
  const store = new VaultStore({ vaultRoot, masterKey, prefix });
  return store.verifyIntegrity();
}
