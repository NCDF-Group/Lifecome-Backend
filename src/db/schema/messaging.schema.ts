import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patients } from './patient.schema';

export const messageThreads = pgTable('message_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  subject: text('subject'),
  /** What the patient picked on "What do you need help with?": booking_payments, online_appointment, clinic_visit or follow_up. */
  topic: text('topic'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id')
    .notNull()
    .references(() => messageThreads.id, { onDelete: 'cascade' }),
  senderType: text('sender_type').notNull(), // 'patient' | 'care_team'
  senderId: uuid('sender_id').notNull(),
  body: text('body').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
});
