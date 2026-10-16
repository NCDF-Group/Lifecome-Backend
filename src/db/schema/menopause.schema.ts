import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patient.schema';
import { providers } from './provider.schema';

/** Menopause care assessment questionnaires submitted for clinician review. */
export const menopauseAssessments = pgTable('menopause_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  symptoms: jsonb('symptoms').$type<Record<string, unknown>>().notNull(),
  hrtHistory: text('hrt_history'),
  medicalHistory: text('medical_history'),
  currentMedications: text('current_medications'),
  goals: text('goals'),
  status: text('status').notNull().default('submitted'), // 'submitted' | 'under_clinician_review' | 'reviewed'
  reviewedByProviderId: uuid('reviewed_by_provider_id').references(() => providers.id),
  clinicianFeedback: text('clinician_feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
