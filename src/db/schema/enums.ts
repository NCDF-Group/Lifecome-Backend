import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Every workflow status in the blueprint (§4.1, §10.1) is an explicit enum, never a boolean —
 * so "is this covered" can't collapse two different unknowns (not-checked vs. not-covered) into
 * one flag.
 */

export const membershipVerificationStatusEnum = pgEnum('membership_verification_status', [
  'pending',
  'verified',
  'not_found',
  'mismatch',
  'expired',
  'payer_unavailable',
  'manual_review',
]);

export const eligibilityStatusEnum = pgEnum('eligibility_status', [
  'covered',
  'co_pay',
  'pre_authorisation_required',
  'excluded',
  'benefit_limit_reached',
  'payer_unavailable',
]);

export const authorisationStatusEnum = pgEnum('authorisation_status', [
  'not_required',
  'pending',
  'approved',
  'declined',
  'expired',
  'more_info_required',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'initiated',
  'pending',
  'successful',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'slot_held',
  'confirmed',
  'rescheduled',
  'cancelled',
  'doctor_unavailable',
  'patient_no_show',
]);

export const consultationStatusEnum = pgEnum('consultation_status', [
  'booked',
  'check_in_open',
  'device_check',
  'waiting',
  'clinician_joining',
  'connected',
  'reconnecting',
  'audio_fallback',
  'ended',
]);

export const consultationModeEnum = pgEnum('consultation_mode', ['video', 'audio']);

export const clinicalNoteStatusEnum = pgEnum('clinical_note_status', ['draft', 'signed', 'amended']);

export const carePlanStatusEnum = pgEnum('care_plan_status', ['active', 'superseded', 'completed']);

export const documentReviewStatusEnum = pgEnum('document_review_status', [
  'awaiting_review',
  'reviewed',
  'amended',
]);

export const payerIntegrationModeEnum = pgEnum('payer_integration_mode', [
  'realtime_api',
  'secure_batch_file',
  'operations_portal',
  'rules_configuration',
]);

export const userAccountStatusEnum = pgEnum('user_account_status', [
  'pending_verification',
  'active',
  'suspended',
  'closed',
]);

export const consentTypeEnum = pgEnum('consent_type', [
  'terms_of_use',
  'privacy_notice',
  'clinical_treatment',
  'record_sharing',
]);

export const careTaskStatusEnum = pgEnum('care_task_status', ['open', 'in_progress', 'done', 'cancelled']);

export const auditActionEnum = pgEnum('audit_action', [
  'record_viewed',
  'record_downloaded',
  'record_shared',
  'clinical_note_signed',
  'clinical_note_amended',
  'payer_decision',
  'payment_state_change',
  'admin_action',
]);

/** The operations-console personas (blueprint §2.3) — see `staff.schema.ts`. */
export const staffRoleEnum = pgEnum('staff_role', [
  'platform_administrator',
  'clinical_administrator',
  'hmo_operations',
  'support_agent',
]);

export const staffAccountStatusEnum = pgEnum('staff_account_status', ['active', 'suspended']);

export const notificationDeliveryStatusEnum = pgEnum('notification_delivery_status', [
  'queued',
  'sent',
  'failed',
]);
