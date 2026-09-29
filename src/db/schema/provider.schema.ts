import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { consultationModeEnum } from './enums';

/** A clinician or provider organisation in the network. */
export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  displayName: text('display_name').notNull(),
  specialty: text('specialty').notNull(),
  languages: text('languages').array().notNull().default([]),
  consultationModes: consultationModeEnum('consultation_modes').array().notNull().default(['video']),
  networkStatus: text('network_status').notNull().default('active'),
  // Optional hub/clinic location — null for a video/audio-only provider with no physical base.
  city: text('city'),
  state: text('state'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Licence/credential evidence, verified before a provider can be assigned patients. */
export const providerCredentials = pgTable('provider_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'cascade' }),
  credentialType: text('credential_type').notNull(),
  licenceNumber: text('licence_number').notNull(),
  issuingBody: text('issuing_body').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

/** A bookable time interval for a provider. Booking a slot moves it to held, then confirmed. */
export const availabilitySlots = pgTable('availability_slots', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'cascade' }),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  isBooked: boolean('is_booked').notNull().default(false),
  heldUntil: timestamp('held_until', { withTimezone: true }),
});
