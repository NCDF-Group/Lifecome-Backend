import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { authorisationStatusEnum, eligibilityStatusEnum } from './enums';
import { memberships, payers } from './payer.schema';
import { clinicalServices } from './catalogue.schema';

/**
 * A point-in-time eligibility decision for one service, with the raw payer response kept as
 * evidence (blueprint §9.1: every adapter call is recorded with source metadata).
 */
export const eligibilityChecks = pgTable('eligibility_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  membershipId: uuid('membership_id')
    .notNull()
    .references(() => memberships.id, { onDelete: 'cascade' }),
  clinicalServiceId: uuid('clinical_service_id')
    .notNull()
    .references(() => clinicalServices.id),
  status: eligibilityStatusEnum('status').notNull(),
  coPayKobo: text('co_pay_kobo'),
  rawResponse: jsonb('raw_response').$type<Record<string, unknown>>(),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
});

/** A pre-authorisation request/decision, with its own lifecycle independent of eligibility. */
export const authorisations = pgTable('authorisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  eligibilityCheckId: uuid('eligibility_check_id')
    .notNull()
    .references(() => eligibilityChecks.id, { onDelete: 'cascade' }),
  payerId: uuid('payer_id')
    .notNull()
    .references(() => payers.id),
  status: authorisationStatusEnum('status').notNull().default('pending'),
  payerReference: text('payer_reference'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  infoRequested: text('info_requested'),
});
