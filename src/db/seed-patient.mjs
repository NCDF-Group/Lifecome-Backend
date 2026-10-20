import 'dotenv/config';

import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

import postgres from 'postgres';

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, PASSWORD_KEY_LENGTH);
  return `${salt}:${derived.toString('hex')}`;
}

/**
 * Standalone bootstrap: `npm run db:seed:patient`. Creates one active patient sign-in account
 * for manually testing the mobile app. Safe to re-run: an existing account is left untouched.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const email = process.env.SEED_PATIENT_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_PATIENT_PASSWORD;
  const firstName = process.env.SEED_PATIENT_FIRST_NAME?.trim() || 'Test';
  const lastName = process.env.SEED_PATIENT_LAST_NAME?.trim() || 'Patient';
  const phoneNumber = process.env.SEED_PATIENT_PHONE_NUMBER?.trim() || '+447700900123';
  if (!email || !password) {
    throw new Error('SEED_PATIENT_EMAIL and SEED_PATIENT_PASSWORD must be set (see .env.example).');
  }

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    // This server may still have the original identity schema. These additive columns are needed
    // by the current patient login and registration code; IF NOT EXISTS makes this safe to repeat.
    await sql.unsafe(`
      ALTER TABLE user_accounts
        ADD COLUMN IF NOT EXISTS first_name text,
        ADD COLUMN IF NOT EXISTS last_name text,
        ADD COLUMN IF NOT EXISTS password_hash text,
        ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone
    `);
    await sql.unsafe(`
      ALTER TABLE otp_challenges
        ALTER COLUMN purpose SET DEFAULT 'email_verification'
    `);

    const [existing] = await sql`select id from user_accounts where email = ${email}`;
    if (existing) {
      console.log(`Patient account ${email} already exists — nothing to do.`);
      return;
    }

    const passwordHash = await hashPassword(password);
    await sql`
      insert into user_accounts
        (email, phone_number, first_name, last_name, password_hash, status, email_verified_at)
      values
        (${email}, ${phoneNumber}, ${firstName}, ${lastName}, ${passwordHash}, 'active', now())
    `;
    console.log(`Created active patient test account ${email}. Remove it or rotate its password after testing.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error('Seeding patient failed:', error);
  process.exitCode = 1;
});
