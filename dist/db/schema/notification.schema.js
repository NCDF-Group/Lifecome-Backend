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
    get notificationLogs () {
        return notificationLogs;
    },
    get patientNotifications () {
        return patientNotifications;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _identityschema = require("./identity.schema");
const _patientschema = require("./patient.schema");
const notificationLogs = (0, _pgcore.pgTable)('notification_logs', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    recipientUserAccountId: (0, _pgcore.uuid)('recipient_user_account_id').notNull().references(()=>_identityschema.userAccounts.id, {
        onDelete: 'cascade'
    }),
    channel: (0, _pgcore.text)('channel').notNull(),
    template: (0, _pgcore.text)('template').notNull(),
    status: (0, _enums.notificationDeliveryStatusEnum)('status').notNull().default('queued'),
    jobId: (0, _pgcore.text)('job_id'),
    failureReason: (0, _pgcore.text)('failure_reason'),
    metadata: (0, _pgcore.jsonb)('metadata').$type().notNull().default({}),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const patientNotifications = (0, _pgcore.pgTable)('patient_notifications', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    kind: (0, _enums.patientNotificationKindEnum)('kind').notNull(),
    body: (0, _pgcore.text)('body').notNull(),
    /** Parts of `body` the app shows in bold (a clinician's name, a date). */ highlights: (0, _pgcore.text)('highlights').array().notNull().default([]),
    /** A quoted snippet shown in a box under the body (e.g. the care team's reply). */ preview: (0, _pgcore.text)('preview'),
    actionLabel: (0, _pgcore.text)('action_label'),
    /** Where the button leads: 'booking', 'records' or 'messages'. */ actionTarget: (0, _pgcore.text)('action_target'),
    actionRef: (0, _pgcore.uuid)('action_ref'),
    readAt: (0, _pgcore.timestamp)('read_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=notification.schema.js.map