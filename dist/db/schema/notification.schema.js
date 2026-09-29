"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "notificationLogs", {
    enumerable: true,
    get: function() {
        return notificationLogs;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _identityschema = require("./identity.schema");
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

//# sourceMappingURL=notification.schema.js.map