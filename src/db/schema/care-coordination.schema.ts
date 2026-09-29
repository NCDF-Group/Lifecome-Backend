import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { careTaskStatusEnum } from './enums';
import { encounters } from './clinical.schema';
import { patients } from './patient.schema';

/** A follow-up task or provider handoff, tracked separately from the clinical note it may relate to. */
export const careTasks = pgTable('care_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  encounterId: uuid('encounter_id').references(() => encounters.id),
  assignedToProviderId: uuid('assigned_to_provider_id'),
  description: text('description').notNull(),
  status: careTaskStatusEnum('status').notNull().default('open'),
  dueAt: timestamp('due_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});
