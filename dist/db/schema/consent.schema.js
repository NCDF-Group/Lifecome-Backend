"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "consentRecords", {
    enumerable: true,
    get: function() {
        return consentRecords;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _patientschema = require("./patient.schema");
const consentRecords = (0, _pgcore.pgTable)('consent_records', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    consentType: (0, _enums.consentTypeEnum)('consent_type').notNull(),
    documentVersion: (0, _pgcore.text)('document_version').notNull(),
    channel: (0, _pgcore.text)('channel').notNull().default('app'),
    grantedAt: (0, _pgcore.timestamp)('granted_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    revokedAt: (0, _pgcore.timestamp)('revoked_at', {
        withTimezone: true
    })
});

//# sourceMappingURL=consent.schema.js.map