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
    /** View 03 — Create Password. Signs the patient in immediately after. */ setPassword(body) {
        return this.identity.setPassword(body.userAccountId, body.password);
    }
    /** Welcome back — email+password sign-in. */ login(body) {
        return this.identity.login(body.email, body.password);
    }
    /** Forgot password, step 1 — always responds the same whether or not the email has an account. */ requestPasswordReset(body) {
        return this.identity.requestPasswordReset(body.email);
    }
    /** Forgot password, step 2 — checks the code without consuming it (see `confirmPasswordReset`). */ verifyPasswordResetCode(body) {
        return this.identity.verifyPasswordResetCode(body.email, body.code);
    }
    /** Forgot password, step 3 — consumes the code and sets the new password. */ confirmPasswordReset(body) {
        return this.identity.confirmPasswordReset(body.email, body.code, body.newPassword);
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
_ts_decorate([
    (0, _common.Post)('password'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.SetPasswordDto === "undefined" ? Object : _registerdto.SetPasswordDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "setPassword", null);
_ts_decorate([
    (0, _common.Post)('login'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.PatientLoginDto === "undefined" ? Object : _registerdto.PatientLoginDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "login", null);
_ts_decorate([
    (0, _common.Post)('password-reset/request'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RequestPasswordResetDto === "undefined" ? Object : _registerdto.RequestPasswordResetDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "requestPasswordReset", null);
_ts_decorate([
    (0, _common.Post)('password-reset/verify'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.VerifyPasswordResetCodeDto === "undefined" ? Object : _registerdto.VerifyPasswordResetCodeDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "verifyPasswordResetCode", null);
_ts_decorate([
    (0, _common.Post)('password-reset/confirm'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.ConfirmPasswordResetDto === "undefined" ? Object : _registerdto.ConfirmPasswordResetDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], IdentityController.prototype, "confirmPasswordReset", null);
IdentityController = _ts_decorate([
    (0, _swagger.ApiTags)('identity'),
    (0, _common.Controller)('identity'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _identityservice.IdentityService === "undefined" ? Object : _identityservice.IdentityService
    ])
], IdentityController);

//# sourceMappingURL=identity.controller.js.map