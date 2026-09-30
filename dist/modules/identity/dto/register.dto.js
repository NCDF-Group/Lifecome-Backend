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
    get PatientLoginDto () {
        return PatientLoginDto;
    },
    get PatientLoginSchema () {
        return PatientLoginSchema;
    },
    get RegisterDto () {
        return RegisterDto;
    },
    get RegisterSchema () {
        return RegisterSchema;
    },
    get RequestOtpDto () {
        return RequestOtpDto;
    },
    get RequestOtpSchema () {
        return RequestOtpSchema;
    },
    get SetPasswordDto () {
        return SetPasswordDto;
    },
    get SetPasswordSchema () {
        return SetPasswordSchema;
    },
    get VerifyOtpDto () {
        return VerifyOtpDto;
    },
    get VerifyOtpSchema () {
        return VerifyOtpSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const RegisterSchema = _zod.z.object({
    email: _zod.z.email(),
    /** Optional contact info only - never used to sign in or verify anything (email OTP is).
   * E.164-ish; loosely validated here, normalised properly once a real SMS provider is wired in
   * for things like appointment reminders. */ phoneNumber: _zod.z.string().min(8).max(20).regex(/^\+?[0-9]+$/, 'Phone number must contain only digits and an optional leading +').optional()
});
let RegisterDto = class RegisterDto extends (0, _zoddto.createZodDto)(RegisterSchema) {
};
const VerifyOtpSchema = _zod.z.object({
    userAccountId: _zod.z.uuid(),
    code: _zod.z.string().length(6)
});
let VerifyOtpDto = class VerifyOtpDto extends (0, _zoddto.createZodDto)(VerifyOtpSchema) {
};
const RequestOtpSchema = _zod.z.object({
    userAccountId: _zod.z.uuid()
});
let RequestOtpDto = class RequestOtpDto extends (0, _zoddto.createZodDto)(RequestOtpSchema) {
};
const SetPasswordSchema = _zod.z.object({
    userAccountId: _zod.z.uuid(),
    password: _zod.z.string().min(8).max(200)
});
let SetPasswordDto = class SetPasswordDto extends (0, _zoddto.createZodDto)(SetPasswordSchema) {
};
const PatientLoginSchema = _zod.z.object({
    email: _zod.z.email(),
    password: _zod.z.string().min(1)
});
let PatientLoginDto = class PatientLoginDto extends (0, _zoddto.createZodDto)(PatientLoginSchema) {
};

//# sourceMappingURL=register.dto.js.map