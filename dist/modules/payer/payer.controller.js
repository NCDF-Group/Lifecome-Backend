"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PayerController", {
    enumerable: true,
    get: function() {
        return PayerController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _idempotentdecorator = require("../../common/interceptors/idempotent.decorator");
const _payerdto = require("./dto/payer.dto");
const _payerservice = require("./payer.service");
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
let PayerController = class PayerController {
    /** View 06 — Select Your HMO. LifeCome HMO may be listed first via `displayOrder`, never hard-coded. */ list() {
        return this.payerService.listParticipatingPayers();
    }
    /** View 07 — Verify HMO Membership. */ verifyMembership(body) {
        return this.payerService.verifyMembership(body.patientId, body.payerCode, body.memberId);
    }
    constructor(payerService){
        this.payerService = payerService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PayerController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)('verify-membership'),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _payerdto.VerifyMembershipDto === "undefined" ? Object : _payerdto.VerifyMembershipDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PayerController.prototype, "verifyMembership", null);
PayerController = _ts_decorate([
    (0, _swagger.ApiTags)('payer'),
    (0, _common.Controller)('payers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _payerservice.PayerService === "undefined" ? Object : _payerservice.PayerService
    ])
], PayerController);

//# sourceMappingURL=payer.controller.js.map