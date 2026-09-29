import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { carePlanStatusEnum, clinicalNoteStatusEnum, documentReviewStatusEnum } from './enums';
import { patients } from './patient.schema';
import { providers } from './provider.schema';
import { appointments } from './booking.schema';

/** One clinical encounter — the anchor every note, care plan, prescription and referral hangs off. */
export const encounters = pgTable('encounters', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .unique()
    .references(() => appointments.id, { onDelete: 'restrict' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'restrict' }),
  providerId: uuid('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'restrict' }),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Append-only: a signed note is never edited. `amendsNoteId` links a correction to the note it
 * amends, so the original stays visible in the history (blueprint §11.1).
 */
export const clinicalNotes = pgTable('clinical_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id')
    .notNull()
    .references(() => encounters.id, { onDelete: 'restrict' }),
  authorProviderId: uuid('author_provider_id')
    .notNull()
    .references(() => providers.id),
  status: clinicalNoteStatusEnum('status').notNull().default('draft'),
  body: text('body').notNull(),
  amendsNoteId: uuid('amends_note_id'),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Versioned: a new row supersedes the previous one for the same encounter lineage. */
export const carePlans = pgTable('care_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id')
    .notNull()
    .references(() => encounters.id, { onDelete: 'restrict' }),
  version: text('version').notNull().default('1'),
  status: carePlanStatusEnum('status').notNull().default('active'),
  summary: text('summary').notNull(),
  followUpDueAt: timestamp('follow_up_due_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id')
    .notNull()
    .references(() => encounters.id, { onDelete: 'restrict' }),
  prescribedByProviderId: uuid('prescribed_by_provider_id')
    .notNull()
    .references(() => providers.id),
  medicationName: text('medication_name').notNull(),
  instructions: text('instructions').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id')
    .notNull()
    .references(() => encounters.id, { onDelete: 'restrict' }),
  referredByProviderId: uuid('referred_by_provider_id')
    .notNull()
    .references(() => providers.id),
  reason: text('reason').notNull(),
  referredToDescription: text('referred_to_description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const diagnosticOrders = pgTable('diagnostic_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  encounterId: uuid('encounter_id')
    .notNull()
    .references(() => encounters.id, { onDelete: 'restrict' }),
  orderedByProviderId: uuid('ordered_by_provider_id')
    .notNull()
    .references(() => providers.id),
  testName: text('test_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Provenance is mandatory: which order it answers, which provider produced it, its review state. */
export const diagnosticResults = pgTable('diagnostic_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  diagnosticOrderId: uuid('diagnostic_order_id')
    .notNull()
    .references(() => diagnosticOrders.id, { onDelete: 'restrict' }),
  originatingProviderName: text('originating_provider_name').notNull(),
  reviewStatus: documentReviewStatusEnum('review_status').notNull().default('awaiting_review'),
  reviewedByProviderId: uuid('reviewed_by_provider_id').references(() => providers.id),
  resultSummary: text('result_summary'),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

/** Metadata for a secure upload; the file itself lives in object storage behind a signed URL. */
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  documentType: text('document_type').notNull(),
  objectKey: text('object_key').notNull(),
  uploadedByProviderId: uuid('uploaded_by_provider_id').references(() => providers.id),
  reviewStatus: documentReviewStatusEnum('review_status').notNull().default('awaiting_review'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
