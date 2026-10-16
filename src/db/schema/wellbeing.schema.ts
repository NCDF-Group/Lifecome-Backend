import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patient.schema';

/** Booked wellbeing sessions for the 3 wellbeing session types. */
export const wellbeingSessions = pgTable('wellbeing_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  sessionType: text('session_type').notNull(), // 'lifestyle_coaching' | 'healthy_eating' | 'stress_management'
  title: text('title').notNull(),
  coachName: text('coach_name').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  status: text('status').notNull().default('booked'), // 'booked' | 'completed' | 'cancelled'
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
