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
    get authorisations () {
        return authorisations;
    },
    get eligibilityChecks () {
        return eligibilityChecks;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _payerschema = require("./payer.schema");
const _catalogueschema = require("./catalogue.schema");
const eligibilityChecks = (0, _pgcore.pgTable)('eligibility_checks', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    membershipId: (0, _pgcore.uuid)('membership_id').notNull().references(()=>_payerschema.memberships.id, {
        onDelete: 'cascade'
    }),
    clinicalServiceId: (0, _pgcore.uuid)('clinical_service_id').notNull().references(()=>_catalogueschema.clinicalServices.id),
    status: (0, _enums.eligibilityStatusEnum)('status').notNull(),
    coPayKobo: (0, _pgcore.text)('co_pay_kobo'),
    rawResponse: (0, _pgcore.jsonb)('raw_response').$type(),
    checkedAt: (0, _pgcore.timestamp)('checked_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const authorisations = (0, _pgcore.pgTable)('authorisations', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    eligibilityCheckId: (0, _pgcore.uuid)('eligibility_check_id').notNull().references(()=>eligibilityChecks.id, {
        onDelete: 'cascade'
    }),
    payerId: (0, _pgcore.uuid)('payer_id').notNull().references(()=>_payerschema.payers.id),
    status: (0, _enums.authorisationStatusEnum)('status').notNull().default('pending'),
    payerReference: (0, _pgcore.text)('payer_reference'),
    requestedAt: (0, _pgcore.timestamp)('requested_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    decidedAt: (0, _pgcore.timestamp)('decided_at', {
        withTimezone: true
    }),
    expiresAt: (0, _pgcore.timestamp)('expires_at', {
        withTimezone: true
    }),
    infoRequested: (0, _pgcore.text)('info_requested')
});

//# sourceMappingURL=eligibility.schema.js.map