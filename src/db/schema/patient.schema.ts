import { date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { userAccounts } from './identity.schema';

/** The clinical identity. One `patients` row per `user_accounts` row (the "one patient identity" rule — blueprint §23). */
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userAccountId: uuid('user_account_id')
    .notNull()
    .unique()
    .references(() => userAccounts.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  sex: text('sex'),
  city: text('city'),
  state: text('state'),
  country: text('country').notNull().default('NG'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * A guardian/dependant relationship. `authority` records what the guardian may do on the
 * dependant's behalf (booking, viewing records, both) — access is still checked per-action.
 */
export const dependantRelationships = pgTable('dependant_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  guardianPatientId: uuid('guardian_patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  dependantPatientId: uuid('dependant_patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  authority: text('authority').notNull().default('booking_and_records'),
  consentedAt: timestamp('consented_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
