"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CareCoordinationController", {
    enumerable: true,
    get: function() {
        return CareCoordinationController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _carecoordinationservice = require("./care-coordination.service");
const _carecoordinationdto = require("./dto/care-coordination.dto");
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
let CareCoordinationController = class CareCoordinationController {
    constructor(careCoordination){
        this.careCoordination = careCoordination;
    }
    create(body) {
        return this.careCoordination.create(body);
    }
    listForPatient(patientId) {
        return this.careCoordination.listForPatient(patientId);
    }
    listForProvider(providerId) {
        return this.careCoordination.listForProvider(providerId);
    }
    complete(id) {
        return this.careCoordination.complete(id);
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _carecoordinationdto.CreateCareTaskDto === "undefined" ? Object : _carecoordinationdto.CreateCareTaskDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], CareCoordinationController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('patients/:patientId'),
    _ts_param(0, (0, _common.Param)('patientId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], CareCoordinationController.prototype, "listForPatient", null);
_ts_decorate([
    (0, _common.Get)('providers/:providerId'),
    _ts_param(0, (0, _common.Param)('providerId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], CareCoordinationController.prototype, "listForProvider", null);
_ts_decorate([
    (0, _common.Post)(':id/complete'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], CareCoordinationController.prototype, "complete", null);
CareCoordinationController = _ts_decorate([
    (0, _swagger.ApiTags)('care-coordination'),
    (0, _common.Controller)('care-tasks'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _carecoordinationservice.CareCoordinationService === "undefined" ? Object : _carecoordinationservice.CareCoordinationService
    ])
], CareCoordinationController);

//# sourceMappingURL=care-coordination.controller.js.map