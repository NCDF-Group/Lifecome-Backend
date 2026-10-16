import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patient.schema';

/** Professional care assessment requests (C02 & C03). */
export const careAssessmentRequests = pgTable('care_assessment_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull().unique(),
  forWhom: text('for_whom').notNull().default('myself'), // 'myself' | 'someone_else'
  recipientName: text('recipient_name'),
  recipientRelationship: text('recipient_relationship'),
  authorityEstablished: boolean('authority_established').notNull().default(false),
  postcode: text('postcode').notNull(),
  supportRequested: jsonb('support_requested').$type<string[]>().notNull(),
  preferredContactMethod: text('preferred_contact_method').notNull().default('phone'), // 'phone' | 'email' | 'in_app'
  preferredContactTimes: text('preferred_contact_times'),
  accessibilityNeeds: text('accessibility_needs'),
  additionalNotes: text('additional_notes'),
  status: text('status').notNull().default('submitted'), // 'submitted' | 'under_review' | 'assessment_scheduled' | 'completed' | 'cancelled'
  scheduledAssessmentAt: timestamp('scheduled_assessment_at', { withTimezone: true }),
  responsibleTeam: text('responsible_team').notNull().default('LifeCome Care Operations'),
  nextAction: text('next_action').notNull().default('Our care coordinator will contact you to review your request and confirm assessment timing.'),
  contactRoute: text('contact_route').notNull().default('+44 20 7946 0912 / care@lifecome.co.uk'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Agreed support plans ("My care arrangements" C04). Distinct from GP clinical care plans! */
export const careArrangements = pgTable('care_arrangements', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  requestId: uuid('request_id').references(() => careAssessmentRequests.id),
  planReference: text('plan_reference').notNull().unique(),
  namedProvider: text('named_provider').notNull().default('LifeCome Care Services UK Ltd'),
  serviceType: text('service_type').notNull(),
  scheduleDescription: text('schedule_description').notNull(),
  chargesDescription: text('charges_description').notNull(),
  fundingBasis: text('funding_basis').notNull().default('Self-funded'),
  careTeamContact: text('care_team_contact').notNull().default('care-team@lifecome.co.uk'),
  status: text('status').notNull().default('active'), // 'active' | 'review_pending' | 'paused' | 'completed' | 'cancelled'
  startDate: timestamp('start_date', { withTimezone: true }),
  reviewDate: timestamp('review_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Scheduled professional care visits. Displayed under Visits with Care filter. */
export const careVisits = pgTable('care_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  arrangementId: uuid('arrangement_id')
    .notNull()
    .references(() => careArrangements.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  careWorkerName: text('care_worker_name').notNull(),
  serviceType: text('service_type').notNull(),
  scheduledStartsAt: timestamp('scheduled_starts_at', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  status: text('status').notNull().default('scheduled'), // 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed'
  address: text('address').notNull(),
  postcode: text('postcode').notNull(),
  notes: text('notes'),
  urgentContactPhone: text('urgent_contact_phone').notNull().default('+44 20 7946 0999'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Urgent operational reports (e.g. missed care visits, urgent change of arrangements). */
export const careUrgentReports = pgTable('care_urgent_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').references(() => careVisits.id),
  issueType: text('issue_type').notNull(), // 'missed_visit' | 'caregiver_late' | 'immediate_assistance' | 'other'
  description: text('description').notNull(),
  status: text('status').notNull().default('reported'), // 'reported' | 'in_investigation' | 'resolved'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
