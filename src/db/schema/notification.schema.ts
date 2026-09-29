import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { notificationDeliveryStatusEnum } from './enums';
import { userAccounts } from './identity.schema';

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
