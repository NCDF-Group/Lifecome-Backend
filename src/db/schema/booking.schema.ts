import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { bookingStatusEnum, consultationModeEnum } from './enums';
import { patients } from './patient.schema';
import { providers, availabilitySlots } from './provider.schema';
import { clinicalServices } from './catalogue.schema';
import { authorisations } from './eligibility.schema';

/** An appointment: the point where patient, provider, service, slot and payer decision converge. */
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'restrict' }),
  providerId: uuid('provider_id')
    .notNull()
    .references(() => providers.id, { onDelete: 'restrict' }),
  clinicalServiceId: uuid('clinical_service_id')
    .notNull()
    .references(() => clinicalServices.id),
  availabilitySlotId: uuid('availability_slot_id')
    .notNull()
    .references(() => availabilitySlots.id),
  consultationMode: consultationModeEnum('consultation_mode').notNull().default('video'),
  status: bookingStatusEnum('status').notNull().default('slot_held'),
  authorisationId: uuid('authorisation_id').references(() => authorisations.id),
  presentingConcern: text('presenting_concern'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
