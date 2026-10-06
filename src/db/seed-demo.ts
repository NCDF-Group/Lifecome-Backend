import 'dotenv/config';

import { and, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { hashPassword } from '../common/security/password';
import { availabilitySlots, clinicalServices, providers, staffAccounts } from './schema';

/**
 * `npm run db:seed:demo` - starter catalogue for a fresh database: the four bookable services, a few
 * clinicians, two weeks of appointment slots, and one doctor login for the console's "My workspace".
 *
 * NOT part of deploy: it only runs when you ask for it, and refuses to run unless SEED_DEMO=yes so it
 * can't be fired against a database by accident. Safe to re-run - it only adds what's missing, and
 * tops up slots so there are always two weeks ahead.
 */

const SERVICES = [
  { code: 'gp-consultation', name: 'GP Consultation', description: 'Talk through a new health concern.', nairaPrice: 6000 },
  { code: 'follow-up', name: 'Follow-up Visit', description: 'Review progress with your doctor.', nairaPrice: 4000 },
  { code: 'results-review', name: 'Results Review', description: 'Discuss your test results.', nairaPrice: 4000 },
  { code: 'referral-advice', name: 'Referral Advice', description: 'Plan your next step in care.', nairaPrice: 5000 },
];

const PROVIDERS = [
  { displayName: 'Dr Adaeze Okafor', specialty: 'General Practitioner', languages: ['English', 'Yoruba', 'Igbo'], city: 'Lagos', state: 'Lagos' },
  { displayName: 'Dr Musa Bello', specialty: 'General Practitioner', languages: ['English', 'Hausa'], city: 'Abuja', state: 'FCT' },
  { displayName: 'Dr Ngozi Eze', specialty: "Women's Health", languages: ['English', 'Igbo'], city: 'Lagos', state: 'Lagos' },
  { displayName: 'Dr Samuel Adeyemi', specialty: 'General Practitioner', languages: ['English', 'Yoruba'], city: 'London', state: 'England' },
];

/** Appointment times, in West Africa Time (UTC+1, no daylight saving): 09:00, 10:30 and 14:00. */
const SLOT_HOURS_WAT = [
  [9, 0],
  [10, 30],
  [14, 0],
];

async function main(): Promise<void> {
  if (process.env.SEED_DEMO !== 'yes') {
    throw new Error('Set SEED_DEMO=yes to confirm you want to seed demo catalogue data into this database.');
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set.');

  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  for (const service of SERVICES) {
    const [existing] = await db.select().from(clinicalServices).where(eq(clinicalServices.code, service.code));
    if (!existing) {
      await db.insert(clinicalServices).values({
        code: service.code,
        name: service.name,
        description: service.description,
        basePriceKobo: service.nairaPrice * 100,
      });
      console.log(`Added service ${service.name}`);
    }
  }

  const providerIds: string[] = [];
  for (const provider of PROVIDERS) {
    const [existing] = await db.select().from(providers).where(eq(providers.displayName, provider.displayName));
    if (existing) {
      providerIds.push(existing.id);
      continue;
    }
    const [created] = await db
      .insert(providers)
      .values({ ...provider, consultationModes: ['video', 'audio', 'in_person'], networkStatus: 'active' })
      .returning();
    providerIds.push(created.id);
    console.log(`Added provider ${provider.displayName}`);
  }

  // Two weeks of slots for every provider, adding only days that have none yet.
  let added = 0;
  const now = Date.now();
  for (const providerId of providerIds) {
    const upcoming = await db
      .select({ startsAt: availabilitySlots.startsAt })
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.providerId, providerId), gt(availabilitySlots.startsAt, new Date(now))));
    const taken = new Set(upcoming.map((slot) => slot.startsAt.getTime()));

    for (let day = 1; day <= 14; day += 1) {
      const date = new Date(now + day * 86_400_000);
      for (const [hour, minute] of SLOT_HOURS_WAT) {
        // Midnight UTC of that day + (hour - 1)h, because WAT is UTC+1.
        const startsAt = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour - 1, minute));
        if (taken.has(startsAt.getTime())) continue;
        await db.insert(availabilitySlots).values({ providerId, startsAt, durationMinutes: 30 });
        added += 1;
      }
    }
  }
  console.log(`Added ${added} appointment slots.`);

  // One doctor login so the console's "My workspace" can be tried straight away.
  const doctorEmail = process.env.SEED_DOCTOR_EMAIL ?? 'doctor@lifecome.test';
  const doctorPassword = process.env.SEED_DOCTOR_PASSWORD;
  const [existingDoctor] = await db.select().from(staffAccounts).where(eq(staffAccounts.email, doctorEmail));
  if (!existingDoctor) {
    if (!doctorPassword) {
      console.log('Skipped the doctor login - set SEED_DOCTOR_PASSWORD (10+ characters) to create one.');
    } else {
      await db.insert(staffAccounts).values({
        email: doctorEmail,
        passwordHash: await hashPassword(doctorPassword),
        fullName: PROVIDERS[0].displayName,
        role: 'clinician',
        providerId: providerIds[0],
      });
      console.log(`Created clinician login ${doctorEmail} for ${PROVIDERS[0].displayName}.`);
    }
  }

  await sql.end();
}

main().catch((error: unknown) => {
  console.error('Seeding demo data failed:', error);
  process.exit(1);
});
