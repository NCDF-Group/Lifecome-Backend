"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "consultationSessions", {
    enumerable: true,
    get: function() {
        return consultationSessions;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _bookingschema = require("./booking.schema");
const consultationSessions = (0, _pgcore.pgTable)('consultation_sessions', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    appointmentId: (0, _pgcore.uuid)('appointment_id').notNull().unique().references(()=>_bookingschema.appointments.id, {
        onDelete: 'cascade'
    }),
    status: (0, _enums.consultationStatusEnum)('status').notNull().default('booked'),
    roomName: (0, _pgcore.text)('room_name'),
    startedAt: (0, _pgcore.timestamp)('started_at', {
        withTimezone: true
    }),
    endedAt: (0, _pgcore.timestamp)('ended_at', {
        withTimezone: true
    })
});

//# sourceMappingURL=consultation.schema.js.map