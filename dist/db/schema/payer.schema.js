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
    get coveragePlans () {
        return coveragePlans;
    },
    get memberships () {
        return memberships;
    },
    get payers () {
        return payers;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _patientschema = require("./patient.schema");
const payers = (0, _pgcore.pgTable)('payers', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    code: (0, _pgcore.text)('code').notNull().unique(),
    name: (0, _pgcore.text)('name').notNull(),
    integrationMode: (0, _enums.payerIntegrationModeEnum)('integration_mode').notNull(),
    isLive: (0, _pgcore.boolean)('is_live').notNull().default(false),
    displayOrder: (0, _pgcore.integer)('display_order').notNull().default(100),
    adapterConfig: (0, _pgcore.jsonb)('adapter_config').$type().notNull().default({}),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const memberships = (0, _pgcore.pgTable)('memberships', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    payerId: (0, _pgcore.uuid)('payer_id').notNull().references(()=>payers.id, {
        onDelete: 'restrict'
    }),
    memberId: (0, _pgcore.text)('member_id').notNull(),
    planId: (0, _pgcore.text)('plan_id'),
    verifiedAt: (0, _pgcore.timestamp)('verified_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const coveragePlans = (0, _pgcore.pgTable)('coverage_plans', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    payerId: (0, _pgcore.uuid)('payer_id').notNull().references(()=>payers.id, {
        onDelete: 'cascade'
    }),
    planCode: (0, _pgcore.text)('plan_code').notNull(),
    name: (0, _pgcore.text)('name').notNull(),
    benefitRules: (0, _pgcore.jsonb)('benefit_rules').$type().notNull().default({}),
    effectiveFrom: (0, _pgcore.timestamp)('effective_from', {
        withTimezone: true
    }).notNull().defaultNow(),
    effectiveTo: (0, _pgcore.timestamp)('effective_to', {
        withTimezone: true
    })
});

//# sourceMappingURL=payer.schema.js.map