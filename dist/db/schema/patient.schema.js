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
    get dependantRelationships () {
        return dependantRelationships;
    },
    get patientAvatars () {
        return patientAvatars;
    },
    get patients () {
        return patients;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _columns = require("./columns");
const _identityschema = require("./identity.schema");
const patients = (0, _pgcore.pgTable)('patients', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    userAccountId: (0, _pgcore.uuid)('user_account_id').notNull().unique().references(()=>_identityschema.userAccounts.id, {
        onDelete: 'cascade'
    }),
    firstName: (0, _pgcore.text)('first_name').notNull(),
    lastName: (0, _pgcore.text)('last_name').notNull(),
    dateOfBirth: (0, _pgcore.date)('date_of_birth').notNull(),
    sex: (0, _pgcore.text)('sex'),
    city: (0, _pgcore.text)('city'),
    state: (0, _pgcore.text)('state'),
    country: (0, _pgcore.text)('country').notNull().default('NG'),
    /** Set when a profile photo exists (bytes in `patientAvatars`); doubles as a cache-buster. */ avatarUpdatedAt: (0, _pgcore.timestamp)('avatar_updated_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const dependantRelationships = (0, _pgcore.pgTable)('dependant_relationships', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    guardianPatientId: (0, _pgcore.uuid)('guardian_patient_id').notNull().references(()=>patients.id, {
        onDelete: 'cascade'
    }),
    dependantPatientId: (0, _pgcore.uuid)('dependant_patient_id').notNull().references(()=>patients.id, {
        onDelete: 'cascade'
    }),
    authority: (0, _pgcore.text)('authority').notNull().default('booking_and_records'),
    consentedAt: (0, _pgcore.timestamp)('consented_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const patientAvatars = (0, _pgcore.pgTable)('patient_avatars', {
    patientId: (0, _pgcore.uuid)('patient_id').primaryKey().references(()=>patients.id, {
        onDelete: 'cascade'
    }),
    contentType: (0, _pgcore.text)('content_type').notNull(),
    image: (0, _columns.bytea)('image').notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=patient.schema.js.map