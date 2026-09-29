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
    get StaffLoginDto () {
        return StaffLoginDto;
    },
    get StaffLoginSchema () {
        return StaffLoginSchema;
    }
});
const _zod = require("zod");
const _zoddto = require("../../../common/validation/zod-dto");
const StaffLoginSchema = _zod.z.object({
    email: _zod.z.email(),
    password: _zod.z.string().min(1)
});
let StaffLoginDto = class StaffLoginDto extends (0, _zoddto.createZodDto)(StaffLoginSchema) {
};

//# sourceMappingURL=auth.dto.js.map