"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SchedulingController", {
    enumerable: true,
    get: function() {
        return SchedulingController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _schedulingdto = require("./dto/scheduling.dto");
const _schedulingservice = require("./scheduling.service");
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
let SchedulingController = class SchedulingController {
    constructor(scheduling){
        this.scheduling = scheduling;
    }
    /** View 13 — Choose Appointment Time. */ listAvailable(providerId) {
        return this.scheduling.listAvailable(providerId);
    }
    createSlot(body) {
        return this.scheduling.createSlot(body);
    }
    hold(body) {
        return this.scheduling.holdSlot(body.slotId);
    }
};
_ts_decorate([
    (0, _common.Get)('providers/:providerId/availability'),
    _ts_param(0, (0, _common.Param)('providerId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], SchedulingController.prototype, "listAvailable", null);
_ts_decorate([
    (0, _common.Post)('slots'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _schedulingdto.CreateSlotDto === "undefined" ? Object : _schedulingdto.CreateSlotDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], SchedulingController.prototype, "createSlot", null);
_ts_decorate([
    (0, _common.Post)('slots/hold'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _schedulingdto.HoldSlotDto === "undefined" ? Object : _schedulingdto.HoldSlotDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], SchedulingController.prototype, "hold", null);
SchedulingController = _ts_decorate([
    (0, _swagger.ApiTags)('scheduling'),
    (0, _common.Controller)('scheduling'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _schedulingservice.SchedulingService === "undefined" ? Object : _schedulingservice.SchedulingService
    ])
], SchedulingController);

//# sourceMappingURL=scheduling.controller.js.map