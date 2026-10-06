"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "appointments", {
    enumerable: true,
    get: function() {
        return appointments;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _patientschema = require("./patient.schema");
const _providerschema = require("./provider.schema");
const _catalogueschema = require("./catalogue.schema");
const _eligibilityschema = require("./eligibility.schema");
const appointments = (0, _pgcore.pgTable)('appointments', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    patientId: (0, _pgcore.uuid)('patient_id').notNull().references(()=>_patientschema.patients.id, {
        onDelete: 'restrict'
    }),
    providerId: (0, _pgcore.uuid)('provider_id').notNull().references(()=>_providerschema.providers.id, {
        onDelete: 'restrict'
    }),
    clinicalServiceId: (0, _pgcore.uuid)('clinical_service_id').notNull().references(()=>_catalogueschema.clinicalServices.id),
    availabilitySlotId: (0, _pgcore.uuid)('availability_slot_id').notNull().references(()=>_providerschema.availabilitySlots.id),
    consultationMode: (0, _enums.consultationModeEnum)('consultation_mode').notNull().default('video'),
    status: (0, _enums.bookingStatusEnum)('status').notNull().default('slot_held'),
    authorisationId: (0, _pgcore.uuid)('authorisation_id').references(()=>_eligibilityschema.authorisations.id),
    presentingConcern: (0, _pgcore.text)('presenting_concern'),
    /** How the patient is paying / being covered ("Choose your access"). */ fundingRoute: (0, _enums.fundingRouteEnum)('funding_route').notNull().default('pay_per_visit'),
    /** For `in_person` visits: the Smart GP clinic's city and name. */ locationCity: (0, _pgcore.text)('location_city'),
    clinicName: (0, _pgcore.text)('clinic_name'),
    /** The "Prepare for ..." intake: symptoms/reason, medicines and allergies, accessibility
   * support, callback number, where the patient will be (online), remote-assessment consent. */ intake: (0, _pgcore.jsonb)('intake').$type(),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=booking.schema.js.map