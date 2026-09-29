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
    /** E.164-ish; loosely validated here, normalised properly once a real SMS provider is wired in. */ phoneNumber: _zod.z.string().min(8).max(20).regex(/^\+?[0-9]+$/, 'Phone number must contain only digits and an optional leading +')
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

//# sourceMappingURL=register.dto.js.map