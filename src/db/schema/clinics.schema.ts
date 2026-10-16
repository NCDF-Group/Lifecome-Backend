import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/** Operating physical clinics for Clinic appointments (in-person GP). */
export const operatingClinics = pgTable('operating_clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  postcode: text('postcode').notNull(),
  phone: text('phone').notNull(),
  accessibilityDetails: text('accessibility_details').notNull(),
  directions: text('directions').notNull(),
  arrivalInstructions: text('arrival_instructions').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
