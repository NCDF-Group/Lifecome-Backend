import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { consentTypeEnum } from './enums';
import { patients } from './patient.schema';

/** A versioned, timestamped record of what a patient agreed to, when, and through which channel. */
export const consentRecords = pgTable('consent_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  consentType: consentTypeEnum('consent_type').notNull(),
  documentVersion: text('document_version').notNull(),
  channel: text('channel').notNull().default('app'),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});
