"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get auditActionEnum () {
        return auditActionEnum;
    },
    get authorisationStatusEnum () {
        return authorisationStatusEnum;
    },
    get bookingStatusEnum () {
        return bookingStatusEnum;
    },
    get carePlanStatusEnum () {
        return carePlanStatusEnum;
    },
    get careTaskStatusEnum () {
        return careTaskStatusEnum;
    },
    get clinicalNoteStatusEnum () {
        return clinicalNoteStatusEnum;
    },
    get consentTypeEnum () {
        return consentTypeEnum;
    },
    get consultationModeEnum () {
        return consultationModeEnum;
    },
    get consultationStatusEnum () {
        return consultationStatusEnum;
    },
    get documentReviewStatusEnum () {
        return documentReviewStatusEnum;
    },
    get eligibilityStatusEnum () {
        return eligibilityStatusEnum;
    },
    get membershipVerificationStatusEnum () {
        return membershipVerificationStatusEnum;
    },
    get notificationDeliveryStatusEnum () {
        return notificationDeliveryStatusEnum;
    },
    get payerIntegrationModeEnum () {
        return payerIntegrationModeEnum;
    },
    get paymentStatusEnum () {
        return paymentStatusEnum;
    },
    get staffAccountStatusEnum () {
        return staffAccountStatusEnum;
    },
    get staffRoleEnum () {
        return staffRoleEnum;
    },
    get userAccountStatusEnum () {
        return userAccountStatusEnum;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const membershipVerificationStatusEnum = (0, _pgcore.pgEnum)('membership_verification_status', [
    'pending',
    'verified',
    'not_found',
    'mismatch',
    'expired',
    'payer_unavailable',
    'manual_review'
]);
const eligibilityStatusEnum = (0, _pgcore.pgEnum)('eligibility_status', [
    'covered',
    'co_pay',
    'pre_authorisation_required',
    'excluded',
    'benefit_limit_reached',
    'payer_unavailable'
]);
const authorisationStatusEnum = (0, _pgcore.pgEnum)('authorisation_status', [
    'not_required',
    'pending',
    'approved',
    'declined',
    'expired',
    'more_info_required'
]);
const paymentStatusEnum = (0, _pgcore.pgEnum)('payment_status', [
    'initiated',
    'pending',
    'successful',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
]);
const bookingStatusEnum = (0, _pgcore.pgEnum)('booking_status', [
    'slot_held',
    'confirmed',
    'rescheduled',
    'cancelled',
    'doctor_unavailable',
    'patient_no_show'
]);
const consultationStatusEnum = (0, _pgcore.pgEnum)('consultation_status', [
    'booked',
    'check_in_open',
    'device_check',
    'waiting',
    'clinician_joining',
    'connected',
    'reconnecting',
    'audio_fallback',
    'ended'
]);
const consultationModeEnum = (0, _pgcore.pgEnum)('consultation_mode', [
    'video',
    'audio'
]);
const clinicalNoteStatusEnum = (0, _pgcore.pgEnum)('clinical_note_status', [
    'draft',
    'signed',
    'amended'
]);
const carePlanStatusEnum = (0, _pgcore.pgEnum)('care_plan_status', [
    'active',
    'superseded',
    'completed'
]);
const documentReviewStatusEnum = (0, _pgcore.pgEnum)('document_review_status', [
    'awaiting_review',
    'reviewed',
    'amended'
]);
const payerIntegrationModeEnum = (0, _pgcore.pgEnum)('payer_integration_mode', [
    'realtime_api',
    'secure_batch_file',
    'operations_portal',
    'rules_configuration'
]);
const userAccountStatusEnum = (0, _pgcore.pgEnum)('user_account_status', [
    'pending_verification',
    'active',
    'suspended',
    'closed'
]);
const consentTypeEnum = (0, _pgcore.pgEnum)('consent_type', [
    'terms_of_use',
    'privacy_notice',
    'clinical_treatment',
    'record_sharing'
]);
const careTaskStatusEnum = (0, _pgcore.pgEnum)('care_task_status', [
    'open',
    'in_progress',
    'done',
    'cancelled'
]);
const auditActionEnum = (0, _pgcore.pgEnum)('audit_action', [
    'record_viewed',
    'record_downloaded',
    'record_shared',
    'clinical_note_signed',
    'clinical_note_amended',
    'payer_decision',
    'payment_state_change',
    'admin_action'
]);
const staffRoleEnum = (0, _pgcore.pgEnum)('staff_role', [
    'platform_administrator',
    'clinical_administrator',
    'hmo_operations',
    'support_agent'
]);
const staffAccountStatusEnum = (0, _pgcore.pgEnum)('staff_account_status', [
    'active',
    'suspended'
]);
const notificationDeliveryStatusEnum = (0, _pgcore.pgEnum)('notification_delivery_status', [
    'queued',
    'sent',
    'failed'
]);

//# sourceMappingURL=enums.js.map