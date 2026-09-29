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
    get TransitionConsultationDto () {
        return TransitionConsultationDto;
    },
    get TransitionConsultationSchema () {
        return TransitionConsultationSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CONSULTATION_STATUSES = [
    'booked',
    'check_in_open',
    'device_check',
    'waiting',
    'clinician_joining',
    'connected',
    'reconnecting',
    'audio_fallback',
    'ended'
];
const TransitionConsultationSchema = _zod.z.object({
    status: _zod.z.enum(CONSULTATION_STATUSES)
});
let TransitionConsultationDto = class TransitionConsultationDto extends (0, _zoddto.createZodDto)(TransitionConsultationSchema) {
};

//# sourceMappingURL=consultation.dto.js.map