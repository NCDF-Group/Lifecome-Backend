"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClinicalRecordsController", {
    enumerable: true,
    get: function() {
        return ClinicalRecordsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _clinicalrecordsservice = require("./clinical-records.service");
const _clinicalrecordsdto = require("./dto/clinical-records.dto");
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
let ClinicalRecordsController = class ClinicalRecordsController {
    createEncounter(body) {
        return this.records.createEncounter(body);
    }
    getEncounter(id) {
        return this.records.getEncounter(id);
    }
    addNote(encounterId, body) {
        return this.records.addNote(encounterId, body.authorProviderId, body.body);
    }
    signNote(id, body) {
        return this.records.signNote(id, body.authorProviderId);
    }
    amendNote(id, body) {
        return this.records.amendNote(id, body.authorProviderId, body.body);
    }
    /** View 20 — Care Plan & Visit Summary. */ addCarePlan(encounterId, body) {
        return this.records.addCarePlan(encounterId, body);
    }
    addPrescription(encounterId, body) {
        return this.records.addPrescription(encounterId, body);
    }
    addReferral(encounterId, body) {
        return this.records.addReferral(encounterId, body);
    }
    addDiagnosticOrder(encounterId, body) {
        return this.records.addDiagnosticOrder(encounterId, body);
    }
    addDiagnosticResult(orderId, body) {
        return this.records.addDiagnosticResult(orderId, body);
    }
    /** View 21 — Health Records (a diagnostic result's clinician-review status). */ reviewDiagnosticResult(id, body) {
        return this.records.reviewDiagnosticResult(id, body.reviewedByProviderId);
    }
    constructor(records){
        this.records = records;
    }
};
_ts_decorate([
    (0, _common.Post)('encounters'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _clinicalrecordsdto.CreateEncounterDto === "undefined" ? Object : _clinicalrecordsdto.CreateEncounterDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "createEncounter", null);
_ts_decorate([
    (0, _common.Get)('encounters/:id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "getEncounter", null);
_ts_decorate([
    (0, _common.Post)('encounters/:id/notes'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreateClinicalNoteDto === "undefined" ? Object : _clinicalrecordsdto.CreateClinicalNoteDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "addNote", null);
_ts_decorate([
    (0, _common.Post)('notes/:id/sign'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.SignClinicalNoteDto === "undefined" ? Object : _clinicalrecordsdto.SignClinicalNoteDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "signNote", null);
_ts_decorate([
    (0, _common.Post)('notes/:id/amend'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.AmendClinicalNoteDto === "undefined" ? Object : _clinicalrecordsdto.AmendClinicalNoteDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "amendNote", null);
_ts_decorate([
    (0, _common.Post)('encounters/:id/care-plans'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreateCarePlanDto === "undefined" ? Object : _clinicalrecordsdto.CreateCarePlanDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ClinicalRecordsController.prototype, "addCarePlan", null);
_ts_decorate([
    (0, _common.Post)('encounters/:id/prescriptions'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreatePrescriptionDto === "undefined" ? Object : _clinicalrecordsdto.CreatePrescriptionDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ClinicalRecordsController.prototype, "addPrescription", null);
_ts_decorate([
    (0, _common.Post)('encounters/:id/referrals'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreateReferralDto === "undefined" ? Object : _clinicalrecordsdto.CreateReferralDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ClinicalRecordsController.prototype, "addReferral", null);
_ts_decorate([
    (0, _common.Post)('encounters/:id/diagnostic-orders'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreateDiagnosticOrderDto === "undefined" ? Object : _clinicalrecordsdto.CreateDiagnosticOrderDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ClinicalRecordsController.prototype, "addDiagnosticOrder", null);
_ts_decorate([
    (0, _common.Post)('diagnostic-orders/:id/results'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.CreateDiagnosticResultDto === "undefined" ? Object : _clinicalrecordsdto.CreateDiagnosticResultDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ClinicalRecordsController.prototype, "addDiagnosticResult", null);
_ts_decorate([
    (0, _common.Post)('diagnostic-results/:id/review'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _clinicalrecordsdto.ReviewDiagnosticResultDto === "undefined" ? Object : _clinicalrecordsdto.ReviewDiagnosticResultDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ClinicalRecordsController.prototype, "reviewDiagnosticResult", null);
ClinicalRecordsController = _ts_decorate([
    (0, _swagger.ApiTags)('clinical-records'),
    (0, _common.Controller)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _clinicalrecordsservice.ClinicalRecordsService === "undefined" ? Object : _clinicalrecordsservice.ClinicalRecordsService
    ])
], ClinicalRecordsController);

//# sourceMappingURL=clinical-records.controller.js.map