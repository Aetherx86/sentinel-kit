import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Aether Systems Master Public Key for Ed25519 verification
const MASTER_PUBKEY_HEX = 'b9be069507dff831e4994f439627abdffb0cfc0e0bca21fe08e85a4794a11c95';

// Reconstruct SPKI PEM from 32-byte raw Ed25519 public key
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const PUBKEY_DER = Buffer.concat([SPKI_PREFIX, Buffer.from(MASTER_PUBKEY_HEX, 'hex')]);
const PUBKEY_PEM = `-----BEGIN PUBLIC KEY-----\n${PUBKEY_DER.toString('base64').match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

export function enforceLicense(productName = 'sentinel-kit') {
  const home = process.env.HOME || '';

  // 1. "Except Me" Author & Developer Bypass Check
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

    return {
      authorized: true,
      licensee: payload.aud,
      tier: payload.tier,
      expires: payload.exp,
      isAuthor: false
    };
  } catch (err) {
    console.error('\x1b[31m[AETHER LICENSE ERROR]\x1b[0m Verification fault:', err.message);
    process.exit(126);
  }
}
