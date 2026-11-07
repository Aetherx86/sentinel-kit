import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PUBKEY_PEM = '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAub4GlQff+DHkmU9Dlie63/sM/A4LyiH+COhaR5ShHJU=\n-----END PUBLIC KEY-----\n';

export function enforceLicense(productName = 'sentinel-kit') {
  const home = process.env.HOME || '';

  // 1. "Except Me" Author Developer Bypass
  const authorKeyPath = path.join(home, '.aether', 'licensing', 'aether_master_private.pem');
  if (process.env.AETHER_AUTHOR_OVERRIDE === '1' || (home && fs.existsSync(authorKeyPath))) {
    return {
      authorized: true,
      licensee: 'Jeffrey Kim (Author / Master Override)',
      tier: 'master-unlimited',
      isAuthor: true
    };
  }

  // 2. Discover Customer License Token
  let token = process.env.AETHER_LICENSE_KEY;
  const localPath = path.resolve(process.cwd(), 'aether-license.key');
  const userPath = path.join(home, '.aether', 'license.key');

  if (!token) {
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      return {
        authorized: true,
        licensee: 'github-actions-ci',
        tier: 'ci-pipeline',
        isAuthor: false
      };
    }
    if (fs.existsSync(localPath)) {
      token = fs.readFileSync(localPath, 'utf8').trim();
    } else if (home && fs.existsSync(userPath)) {
      token = fs.readFileSync(userPath, 'utf8').trim();
    }
  }

  if (!token || !token.startsWith('AETH-LIC.')) {
    console.error('\x1b[31m[AETHER LICENSE REQUIRED]\x1b[0m');
    console.error(`Commercial execution of '${productName}' requires a signed Ed25519 license key.`);
    console.error(`- Missing token in: ~/.aether/license.key or env variable AETHER_LICENSE_KEY`);
    console.error(`- Purchase license at: https://aetherx86.github.io/#products (or PayPal @Aetherx86)`);
    process.exit(126);
  }

  // 3. Cryptographic Ed25519 Verification
  const parts = token.slice('AETH-LIC.'.length).split('.');
  if (parts.length !== 2) {
    console.error('\x1b[31m[AETHER LICENSE INVALID]\x1b[0m License token structure is malformed.');
    process.exit(126);
  }

  const [payloadB64, sigB64] = parts;
  try {
    const signature = Buffer.from(sigB64, 'base64url');
    const isOk = crypto.verify(null, Buffer.from(payloadB64), PUBKEY_PEM, signature);

    if (!isOk) {
      console.error('\x1b[31m[AETHER LICENSE REJECTED]\x1b[0m Cryptographic Ed25519 signature mismatch.');
      process.exit(126);
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      console.error(`\x1b[31m[AETHER LICENSE EXPIRED]\x1b[0m License for ${payload.aud} expired at ${new Date(payload.exp * 1000).toISOString()}`);
      process.exit(126);
    }

    if (payload.sub && payload.sub.toLowerCase() !== productName.toLowerCase() && payload.sub.toLowerCase() !== 'sentinel-kit' && payload.sub.toLowerCase() !== 'all') {
      console.error(`\x1b[31m[AETHER LICENSE MISMATCH]\x1b[0m Key issued for '${payload.sub}', but required for '${productName}'.`);
      process.exit(126);
    }

    return {
      authorized: true,
      licensee: payload.aud,
      tier: payload.tier,
      expires: payload.exp,
      isAuthor: false
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('\x1b[31m[AETHER LICENSE ERROR]\x1b[0m Verification fault:', msg);
    process.exit(126);
  }
}
