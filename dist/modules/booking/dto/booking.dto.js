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
    get BookingStatusSchema () {
        return BookingStatusSchema;
    },
    get CreateAppointmentDto () {
        return CreateAppointmentDto;
    },
    get CreateAppointmentSchema () {
        return CreateAppointmentSchema;
    },
    get ListAppointmentsQueryDto () {
        return ListAppointmentsQueryDto;
    },
    get ListAppointmentsQuerySchema () {
        return ListAppointmentsQuerySchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const BookingStatusSchema = _zod.z.enum([
    'slot_held',
    'confirmed',
    'rescheduled',
    'cancelled',
    'doctor_unavailable',
    'patient_no_show'
]);
const ListAppointmentsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    status: BookingStatusSchema.optional(),
    patientId: _zod.z.uuid().optional(),
    providerId: _zod.z.uuid().optional()
});
let ListAppointmentsQueryDto = class ListAppointmentsQueryDto extends (0, _zoddto.createZodDto)(ListAppointmentsQuerySchema) {
};
const CreateAppointmentSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    providerId: _zod.z.uuid(),
    clinicalServiceId: _zod.z.uuid(),
    availabilitySlotId: _zod.z.uuid(),
    consultationMode: _zod.z.enum([
        'video',
        'audio'
    ]).default('video'),
    presentingConcern: _zod.z.string().max(2000).optional()
});
let CreateAppointmentDto = class CreateAppointmentDto extends (0, _zoddto.createZodDto)(CreateAppointmentSchema) {
};

//# sourceMappingURL=booking.dto.js.map