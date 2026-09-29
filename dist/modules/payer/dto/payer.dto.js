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
    get VerifyMembershipDto () {
        return VerifyMembershipDto;
    },
    get VerifyMembershipSchema () {
        return VerifyMembershipSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const VerifyMembershipSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    payerCode: _zod.z.string().min(1),
    memberId: _zod.z.string().min(1)
});
let VerifyMembershipDto = class VerifyMembershipDto extends (0, _zoddto.createZodDto)(VerifyMembershipSchema) {
};

//# sourceMappingURL=payer.dto.js.map