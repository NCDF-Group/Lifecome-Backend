import { boolean, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patient.schema';

/** Insurance products available to explore. */
export const insuranceProducts = pgTable('insurance_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  insurerName: text('insurer_name').notNull(),
  distributorDetails: text('distributor_details').notNull(),
  summary: text('summary').notNull(),
  benefits: jsonb('benefits').$type<string[]>().notNull().default([]),
  exclusions: jsonb('exclusions').$type<string[]>().notNull().default([]),
  eligibilityCriteria: text('eligibility_criteria').notNull(),
  monthlyPremiumEstimate: text('monthly_premium_estimate').notNull(),
  policyDocumentUrl: text('policy_document_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Linked insurance policies for patients (I03 & I04).
 * Verification states: 'unverified' | 'verification_pending' | 'verified' | 'expired' | 'unable_to_verify'
 */
export const insurancePolicies = pgTable('insurance_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  providerName: text('provider_name').notNull(),
  policyNumber: text('policy_number').notNull(),
  policyHolderName: text('policy_holder_name').notNull(),
  verificationStatus: text('verification_status').notNull().default('verification_pending'),
  coverageDetails: jsonb('coverage_details').$type<Record<string, unknown>>(),
  startDate: timestamp('start_date', { withTimezone: true }),
  renewalDate: timestamp('renewal_date', { withTimezone: true }),
  providerContactPhone: text('provider_contact_phone').notNull().default('+44 800 001 002'),
  providerContactEmail: text('provider_contact_email').notNull().default('support@insurance-provider.co.uk'),
  claimsProcedure: text('claims_procedure').notNull().default('Submit claims directly through provider portal or contact claims support line.'),
  cancellationRoute: text('cancellation_route').notNull().default('Contact provider directly at least 14 days prior to monthly renewal.'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Service-specific cover checks (I03).
 * Funding states: 'included' | 'additional_payment_required' | 'authorisation_pending' | 'not_included'
 */
export const insuranceCoverChecks = pgTable('insurance_cover_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  policyId: uuid('policy_id')
    .notNull()
    .references(() => insurancePolicies.id, { onDelete: 'cascade' }),
  serviceCode: text('service_code').notNull(),
  serviceName: text('service_name').notNull(),
  fundingStatus: text('funding_status').notNull(),
  coPayAmount: text('co_pay_amount'),
  preAuthRequired: boolean('pre_auth_required').notNull().default(false),
  notes: text('notes'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
});
