import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** The bookable service catalogue (GP consultation, follow-up, results review, ...). */
export const clinicalServices = pgTable('clinical_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  defaultDurationMinutes: integer('default_duration_minutes').notNull().default(30),
  basePriceKobo: integer('base_price_kobo').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
