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
    get messageThreads () {
        return messageThreads;
    },
    get messages () {
        return messages;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _patientschema = require("./patient.schema");
const messageThreads = (0, _pgcore.pgTable)('message_threads', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    subject: (0, _pgcore.text)('subject'),
    /** What the patient picked on "What do you need help with?": booking_payments, online_appointment, clinic_visit or follow_up. */ topic: (0, _pgcore.text)('topic'),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const messages = (0, _pgcore.pgTable)('messages', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    threadId: (0, _pgcore.uuid)('thread_id').notNull().references(()=>messageThreads.id, {
        onDelete: 'cascade'
    }),
    senderType: (0, _pgcore.text)('sender_type').notNull(),
    senderId: (0, _pgcore.uuid)('sender_id').notNull(),
    body: (0, _pgcore.text)('body').notNull(),
    sentAt: (0, _pgcore.timestamp)('sent_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=messaging.schema.js.map