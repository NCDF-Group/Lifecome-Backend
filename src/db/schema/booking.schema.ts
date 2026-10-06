import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { bookingStatusEnum, consultationModeEnum, fundingRouteEnum } from './enums';
import { patients } from './patient.schema';
import { providers, availabilitySlots } from './provider.schema';
import { clinicalServices } from './catalogue.schema';
import { authorisations } from './eligibility.schema';

export interface AppointmentIntake {
  reason?: string;
  medicinesAndAllergies?: string;
  accessibilitySupport?: string;
  callbackNumber?: string;
  patientLocation?: string;
  understoodRemoteLimits?: boolean;
}

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
  /** How the patient is paying / being covered ("Choose your access"). */
  fundingRoute: fundingRouteEnum('funding_route').notNull().default('pay_per_visit'),
  /** For `in_person` visits: the Smart GP clinic's city and name. */
  locationCity: text('location_city'),
  clinicName: text('clinic_name'),
  /** The "Prepare for ..." intake: symptoms/reason, medicines and allergies, accessibility
   * support, callback number, where the patient will be (online), remote-assessment consent. */
  intake: jsonb('intake').$type<AppointmentIntake>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
