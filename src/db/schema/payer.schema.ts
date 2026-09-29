import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { payerIntegrationModeEnum } from './enums';
import { patients } from './patient.schema';

/**
 * The participating-payer registry (blueprint §9). `displayOrder` is a product/marketing
 * decision (LifeCome HMO may be listed first) and must never be read by domain logic to pick a
 * default payer — see the developer acceptance checklist, blueprint §21.
 */
export const payers = pgTable('payers', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  integrationMode: payerIntegrationModeEnum('integration_mode').notNull(),
  isLive: boolean('is_live').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(100),
  adapterConfig: jsonb('adapter_config').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Links a patient to a payer membership. Coverage details live on `coveragePlans`. */
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  payerId: uuid('payer_id')
    .notNull()
    .references(() => payers.id, { onDelete: 'restrict' }),
  memberId: text('member_id').notNull(),
  planId: text('plan_id'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Plan-level metadata and benefit rules, as returned or configured for a payer (blueprint §9.1). */
export const coveragePlans = pgTable('coverage_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  payerId: uuid('payer_id')
    .notNull()
    .references(() => payers.id, { onDelete: 'cascade' }),
  planCode: text('plan_code').notNull(),
  name: text('name').notNull(),
  benefitRules: jsonb('benefit_rules').$type<Record<string, unknown>>().notNull().default({}),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull().defaultNow(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
});
