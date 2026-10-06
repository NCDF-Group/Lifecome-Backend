"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsultationController", {
    enumerable: true,
    get: function() {
        return ConsultationController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _bookingservice = require("../booking/booking.service");
const _consultationservice = require("./consultation.service");
const _consultationdto = require("./dto/consultation.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
/** States the patient's own device may move the session into; joining/connecting belongs to the clinician. */ const PATIENT_STATES = [
    'check_in_open',
    'device_check',
    'waiting',
    'reconnecting',
    'audio_fallback',
    'ended'
];
let ConsultationController = class ConsultationController {
    /** View 18 — Consultation Waiting Room. */ async get(account, appointmentId) {
        await this.booking.getForPatient(account.sub, appointmentId);
        return this.consultations.getOrCreateForAppointment(appointmentId);
    }
    /** View 19 — Video / Audio Consultation (and every waiting-room state in between). */ async transition(account, appointmentId, body) {
        await this.booking.getForPatient(account.sub, appointmentId);
        if (!PATIENT_STATES.includes(body.status)) {
            throw new _common.ForbiddenException('Only your clinician can move the consultation into that state.');
        }
        return this.consultations.transition(appointmentId, body.status);
    }
    constructor(consultations, booking){
        this.consultations = consultations;
        this.booking = booking;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _commonauthmodule.CurrentPatientAccount)()),
    _ts_param(1, (0, _common.Param)('appointmentId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof PatientAccountToken === "undefined" ? Object : PatientAccountToken,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ConsultationController.prototype, "get", null);
_ts_decorate([
    (0, _common.Post)('transition'),
    _ts_param(0, (0, _commonauthmodule.CurrentPatientAccount)()),
    _ts_param(1, (0, _common.Param)('appointmentId', _common.ParseUUIDPipe)),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof PatientAccountToken === "undefined" ? Object : PatientAccountToken,
        String,
        typeof _consultationdto.TransitionConsultationDto === "undefined" ? Object : _consultationdto.TransitionConsultationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ConsultationController.prototype, "transition", null);
ConsultationController = _ts_decorate([
    (0, _swagger.ApiTags)('consultation'),
    (0, _common.UseGuards)(_commonauthmodule.PatientAuthGuard),
    (0, _common.Controller)('appointments/:appointmentId/consultation'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _consultationservice.ConsultationService === "undefined" ? Object : _consultationservice.ConsultationService,
        typeof _bookingservice.BookingService === "undefined" ? Object : _bookingservice.BookingService
    ])
], ConsultationController);

//# sourceMappingURL=consultation.controller.js.map