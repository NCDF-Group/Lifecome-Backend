"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PatientController", {
    enumerable: true,
    get: function() {
        return PatientController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _patientdto = require("./dto/patient.dto");
const _patientservice = require("./patient.service");
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
let PatientController = class PatientController {
    /** View 03 — Patient Profile (creation). */ create(body) {
        return this.patients.createProfile(body);
    }
    get(id) {
        return this.patients.getById(id);
    }
    update(id, body) {
        return this.patients.update(id, body);
    }
    constructor(patients){
        this.patients = patients;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _patientdto.CreatePatientProfileDto === "undefined" ? Object : _patientdto.CreatePatientProfileDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PatientController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PatientController.prototype, "get", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _patientdto.UpdatePatientProfileDto === "undefined" ? Object : _patientdto.UpdatePatientProfileDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PatientController.prototype, "update", null);
PatientController = _ts_decorate([
    (0, _swagger.ApiTags)('patient'),
    (0, _common.Controller)('patients'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _patientservice.PatientService === "undefined" ? Object : _patientservice.PatientService
    ])
], PatientController);

//# sourceMappingURL=patient.controller.js.map