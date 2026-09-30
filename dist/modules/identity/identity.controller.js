"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdentityController", {
    enumerable: true,
    get: function() {
        return IdentityController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _registerdto = require("./dto/register.dto");
const _identityservice = require("./identity.service");
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
let IdentityController = class IdentityController {
    /** View 01 — Sign In / Create Account. Also sends the first OTP, by email. */ register(body) {
        return this.identity.register(body.email, body.phoneNumber);
    }
    requestOtp(body) {
        return this.identity.requestOtp(body.userAccountId);
    }
    /** View 02 — Verify Email. */ verifyOtp(body) {
        return this.identity.verifyOtp(body.userAccountId, body.code);
    }
    constructor(identity){
        this.identity = identity;
    }
};
_ts_decorate([
    (0, _common.Post)('register'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RegisterDto === "undefined" ? Object : _registerdto.RegisterDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "register", null);
_ts_decorate([
    (0, _common.Post)('otp/request'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RequestOtpDto === "undefined" ? Object : _registerdto.RequestOtpDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "requestOtp", null);
_ts_decorate([
    (0, _common.Post)('otp/verify'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.VerifyOtpDto === "undefined" ? Object : _registerdto.VerifyOtpDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "verifyOtp", null);
IdentityController = _ts_decorate([
    (0, _swagger.ApiTags)('identity'),
    (0, _common.Controller)('identity'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _identityservice.IdentityService === "undefined" ? Object : _identityservice.IdentityService
    ])
], IdentityController);

//# sourceMappingURL=identity.controller.js.map