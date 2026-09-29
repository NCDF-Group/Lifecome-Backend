import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { auditActionEnum } from './enums';

/**
 * Append-only. Nothing in the application ever updates or deletes a row here — see
 * `modules/audit/audit.service.ts`, which only ever inserts. `previousHash`/`hash` form a simple
 * hash chain so a gap or edit is detectable (blueprint §12).
 */
export const auditEvents = pgTable('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorType: text('actor_type').notNull(), // 'patient' | 'provider' | 'staff' | 'system'
  actorId: text('actor_id').notNull(),
  action: auditActionEnum('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  correlationId: text('correlation_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  previousHash: text('previous_hash'),
  hash: text('hash').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
});
