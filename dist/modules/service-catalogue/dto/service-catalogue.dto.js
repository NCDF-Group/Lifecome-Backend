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
    get CreateClinicalServiceDto () {
        return CreateClinicalServiceDto;
    },
    get CreateClinicalServiceSchema () {
        return CreateClinicalServiceSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateClinicalServiceSchema = _zod.z.object({
    code: _zod.z.string().min(1).max(50),
    name: _zod.z.string().min(1).max(200),
    description: _zod.z.string().max(2000).optional(),
    defaultDurationMinutes: _zod.z.number().int().positive().max(240).default(30),
    basePriceKobo: _zod.z.number().int().nonnegative()
});
let CreateClinicalServiceDto = class CreateClinicalServiceDto extends (0, _zoddto.createZodDto)(CreateClinicalServiceSchema) {
};

//# sourceMappingURL=service-catalogue.dto.js.map