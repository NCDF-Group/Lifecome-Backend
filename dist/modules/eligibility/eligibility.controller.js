"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EligibilityController", {
    enumerable: true,
    get: function() {
        return EligibilityController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _eligibilitydto = require("./dto/eligibility.dto");
const _eligibilityservice = require("./eligibility.service");
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
let EligibilityController = class EligibilityController {
    /** View 09 — Check Service Eligibility. */ check(body) {
        return this.eligibility.check(body.membershipId, body.clinicalServiceCode);
    }
    constructor(eligibility){
        this.eligibility = eligibility;
    }
};
_ts_decorate([
    (0, _common.Post)('check'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _eligibilitydto.CheckEligibilityDto === "undefined" ? Object : _eligibilitydto.CheckEligibilityDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], EligibilityController.prototype, "check", null);
EligibilityController = _ts_decorate([
    (0, _swagger.ApiTags)('eligibility'),
    (0, _common.Controller)('eligibility'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _eligibilityservice.EligibilityService === "undefined" ? Object : _eligibilityservice.EligibilityService
    ])
], EligibilityController);

//# sourceMappingURL=eligibility.controller.js.map