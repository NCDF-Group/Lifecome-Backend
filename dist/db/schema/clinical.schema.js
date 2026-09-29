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
    get carePlans () {
        return carePlans;
    },
    get clinicalNotes () {
        return clinicalNotes;
    },
    get diagnosticOrders () {
        return diagnosticOrders;
    },
    get diagnosticResults () {
        return diagnosticResults;
    },
    get documents () {
        return documents;
    },
    get encounters () {
        return encounters;
    },
    get prescriptions () {
        return prescriptions;
    },
    get referrals () {
        return referrals;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _patientschema = require("./patient.schema");
const _providerschema = require("./provider.schema");
const _bookingschema = require("./booking.schema");
const encounters = (0, _pgcore.pgTable)('encounters', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    appointmentId: (0, _pgcore.uuid)('appointment_id').notNull().unique().references(()=>_bookingschema.appointments.id, {
        onDelete: 'restrict'
    }),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'restrict'
    }),
    providerId: (0, _pgcore.uuid)('provider_id').notNull().references(()=>_providerschema.providers.id, {
        onDelete: 'restrict'
    }),
    occurredAt: (0, _pgcore.timestamp)('occurred_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const clinicalNotes = (0, _pgcore.pgTable)('clinical_notes', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    encounterId: (0, _pgcore.uuid)('encounter_id').notNull().references(()=>encounters.id, {
        onDelete: 'restrict'
    }),
    authorProviderId: (0, _pgcore.uuid)('author_provider_id').notNull().references(()=>_providerschema.providers.id),
    status: (0, _enums.clinicalNoteStatusEnum)('status').notNull().default('draft'),
    body: (0, _pgcore.text)('body').notNull(),
    amendsNoteId: (0, _pgcore.uuid)('amends_note_id'),
    signedAt: (0, _pgcore.timestamp)('signed_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const carePlans = (0, _pgcore.pgTable)('care_plans', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    encounterId: (0, _pgcore.uuid)('encounter_id').notNull().references(()=>encounters.id, {
        onDelete: 'restrict'
    }),
    version: (0, _pgcore.text)('version').notNull().default('1'),
    status: (0, _enums.carePlanStatusEnum)('status').notNull().default('active'),
    summary: (0, _pgcore.text)('summary').notNull(),
    followUpDueAt: (0, _pgcore.timestamp)('follow_up_due_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const prescriptions = (0, _pgcore.pgTable)('prescriptions', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    encounterId: (0, _pgcore.uuid)('encounter_id').notNull().references(()=>encounters.id, {
        onDelete: 'restrict'
    }),
    prescribedByProviderId: (0, _pgcore.uuid)('prescribed_by_provider_id').notNull().references(()=>_providerschema.providers.id),
    medicationName: (0, _pgcore.text)('medication_name').notNull(),
    instructions: (0, _pgcore.text)('instructions').notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const referrals = (0, _pgcore.pgTable)('referrals', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    encounterId: (0, _pgcore.uuid)('encounter_id').notNull().references(()=>encounters.id, {
        onDelete: 'restrict'
    }),
    referredByProviderId: (0, _pgcore.uuid)('referred_by_provider_id').notNull().references(()=>_providerschema.providers.id),
    reason: (0, _pgcore.text)('reason').notNull(),
    referredToDescription: (0, _pgcore.text)('referred_to_description').notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const diagnosticOrders = (0, _pgcore.pgTable)('diagnostic_orders', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    encounterId: (0, _pgcore.uuid)('encounter_id').notNull().references(()=>encounters.id, {
        onDelete: 'restrict'
    }),
    orderedByProviderId: (0, _pgcore.uuid)('ordered_by_provider_id').notNull().references(()=>_providerschema.providers.id),
    testName: (0, _pgcore.text)('test_name').notNull(),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});
const diagnosticResults = (0, _pgcore.pgTable)('diagnostic_results', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    diagnosticOrderId: (0, _pgcore.uuid)('diagnostic_order_id').notNull().references(()=>diagnosticOrders.id, {
        onDelete: 'restrict'
    }),
    originatingProviderName: (0, _pgcore.text)('originating_provider_name').notNull(),
    reviewStatus: (0, _enums.documentReviewStatusEnum)('review_status').notNull().default('awaiting_review'),
    reviewedByProviderId: (0, _pgcore.uuid)('reviewed_by_provider_id').references(()=>_providerschema.providers.id),
    resultSummary: (0, _pgcore.text)('result_summary'),
    receivedAt: (0, _pgcore.timestamp)('received_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    reviewedAt: (0, _pgcore.timestamp)('reviewed_at', {
        withTimezone: true
    })
});
const documents = (0, _pgcore.pgTable)('documents', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    encounterId: (0, _pgcore.uuid)('encounter_id').references(()=>encounters.id),
    documentType: (0, _pgcore.text)('document_type').notNull(),
    objectKey: (0, _pgcore.text)('object_key').notNull(),
    uploadedByProviderId: (0, _pgcore.uuid)('uploaded_by_provider_id').references(()=>_providerschema.providers.id),
    reviewStatus: (0, _enums.documentReviewStatusEnum)('review_status').notNull().default('awaiting_review'),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=clinical.schema.js.map