import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

import { hashPassword } from '../common/security/password';
import { staffAccounts } from './schema';

/**
 * Standalone bootstrap: `npm run db:seed:staff`. Creates the first `platform_administrator` so
 * someone can sign in and create every other staff account through the API — otherwise
 * `POST /admin/staff` is a chicken-and-egg problem (it requires a platform_administrator to call
 * it). Safe to re-run: does nothing if SEED_ADMIN_EMAIL already has an account.
 */
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Platform Administrator';
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (see .env.example).');
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql, { schema: { staffAccounts } });

  const [existing] = await db.select().from(staffAccounts).where(eq(staffAccounts.email, email));
  if (existing) {
    console.log(`Staff account ${email} already exists — nothing to do.`);
  } else {
    const passwordHash = await hashPassword(password);
    await db.insert(staffAccounts).values({ email, passwordHash, fullName, role: 'platform_administrator' });
    console.log(`Created platform_administrator ${email}. Change its password after first sign-in.`);
  }

  await sql.end();
}

main().catch((error: unknown) => {
  console.error('Seeding staff failed:', error);
  process.exit(1);
});
