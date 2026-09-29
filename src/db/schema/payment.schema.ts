import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { paymentStatusEnum } from './enums';
import { appointments } from './booking.schema';

/**
 * A direct-pay transaction. The amount is always server-computed at intent-creation time — see
 * `payment.service.ts` — never trusted from the client (blueprint §13).
 */
export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'restrict' }),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').notNull().default('NGN'),
  status: paymentStatusEnum('status').notNull().default('initiated'),
  gateway: text('gateway').notNull(),
  gatewayReference: text('gateway_reference'),
  receiptNumber: text('receipt_number').unique(),
  idempotencyKey: text('idempotency_key').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
