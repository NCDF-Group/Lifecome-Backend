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
    get RequestAuthorisationDto () {
        return RequestAuthorisationDto;
    },
    get RequestAuthorisationSchema () {
        return RequestAuthorisationSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const RequestAuthorisationSchema = _zod.z.object({
    eligibilityCheckId: _zod.z.uuid(),
    clinicalServiceCode: _zod.z.string().min(1),
    providerId: _zod.z.uuid(),
    appointmentId: _zod.z.uuid()
});
let RequestAuthorisationDto = class RequestAuthorisationDto extends (0, _zoddto.createZodDto)(RequestAuthorisationSchema) {
};

//# sourceMappingURL=authorisation.dto.js.map