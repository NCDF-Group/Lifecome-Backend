"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "careTasks", {
    enumerable: true,
    get: function() {
        return careTasks;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _clinicalschema = require("./clinical.schema");
const _patientschema = require("./patient.schema");
const careTasks = (0, _pgcore.pgTable)('care_tasks', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'cascade'
    }),
    encounterId: (0, _pgcore.uuid)('encounter_id').references(()=>_clinicalschema.encounters.id),
    assignedToProviderId: (0, _pgcore.uuid)('assigned_to_provider_id'),
    description: (0, _pgcore.text)('description').notNull(),
    status: (0, _enums.careTaskStatusEnum)('status').notNull().default('open'),
    dueAt: (0, _pgcore.timestamp)('due_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    completedAt: (0, _pgcore.timestamp)('completed_at', {
        withTimezone: true
    })
});

//# sourceMappingURL=care-coordination.schema.js.map