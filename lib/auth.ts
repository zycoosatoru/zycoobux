import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'zycoo';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gua.azky.277';
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'zycoobux-ultra-secure-admin-session-secret-32chars!';

export const SESSION_COOKIE_NAME = 'zycoo_admin_token';
export const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a || '', 'utf8');
  const bufB = Buffer.from(b || '', 'utf8');

  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify admin login credentials
 */
export function verifyAdminCredentials(user: string, pass: string): boolean {
  const cleanUser = (user || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();
  const userMatch = timingSafeCompare(cleanUser, ADMIN_USERNAME.toLowerCase());
  const passMatch = timingSafeCompare(cleanPass, ADMIN_PASSWORD);
  return userMatch && passMatch;
}

/**
 * Generate HMAC signed session token
 */
export function createSessionToken(username: string): string {
  const payload = {
    u: username,
    exp: Date.now() + SESSION_MAX_AGE_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Validate HMAC signed session token
 */
export function verifySessionToken(token: string | undefined): { valid: boolean; username?: string } {
  if (!token) return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [payloadB64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  if (!timingSafeCompare(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);

    if (Date.now() > data.exp) {
      return { valid: false };
    }

    return { valid: true, username: data.u };
  } catch {
    return { valid: false };
  }
}
