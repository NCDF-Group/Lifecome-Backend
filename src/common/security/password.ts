import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

/**
 * Node's built-in scrypt, salted per password and stored as `salt:hash` (both hex) — no extra
 * dependency (bcrypt/argon2, which need native bindings) for something `node:crypto` already
 * does well, matching this codebase's existing OTP-hashing style in `identity.service.ts`.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const hashBuffer = Buffer.from(hash, 'hex');
  if (hashBuffer.length !== derived.length) return false;

  return timingSafeEqual(hashBuffer, derived);
}
