import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { notificationDeliveryStatusEnum, patientNotificationKindEnum } from './enums';
import { userAccounts } from './identity.schema';
import { patients } from './patient.schema';

/**
 * A record of what `NotificationsService.enqueue` handed to the queue, and what became of it —
 * the queue itself (BullMQ/Redis) is not durable admin-console history, so this table is what
 * `/admin/notifications` reads from. Written on enqueue (`status: 'queued'`) and updated by
 * `NotificationsProcessor` once the job runs.
 */
export const notificationLogs = pgTable('notification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientUserAccountId: uuid('recipient_user_account_id')
    .notNull()
    .references(() => userAccounts.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // 'sms' | 'email' | 'push' | 'in_app'
  template: text('template').notNull(),
  status: notificationDeliveryStatusEnum('status').notNull().default('queued'),
  jobId: text('job_id'),
  failureReason: text('failure_reason'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * A patient's in-app notification feed (the bell in the mobile app): "your booking is confirmed", "the care
 * team replied". Unlike `notificationLogs` (delivery history for SMS/email), this is what the patient reads.
 */
export const patientNotifications = pgTable('patient_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  kind: patientNotificationKindEnum('kind').notNull(),
  body: text('body').notNull(),
  /** Parts of `body` the app shows in bold (a clinician's name, a date). */
  highlights: text('highlights').array().notNull().default([]),
  /** A quoted snippet shown in a box under the body (e.g. the care team's reply). */
  preview: text('preview'),
  actionLabel: text('action_label'),
  /** Where the button leads: 'booking', 'records' or 'messages'. */
  actionTarget: text('action_target'),
  actionRef: uuid('action_ref'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
