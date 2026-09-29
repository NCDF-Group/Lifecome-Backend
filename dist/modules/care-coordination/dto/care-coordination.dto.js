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
    get CreateCareTaskDto () {
        return CreateCareTaskDto;
    },
    get CreateCareTaskSchema () {
        return CreateCareTaskSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateCareTaskSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    encounterId: _zod.z.uuid().optional(),
    assignedToProviderId: _zod.z.uuid().optional(),
    description: _zod.z.string().min(1).max(2000),
    dueAt: _zod.z.iso.datetime().optional()
});
let CreateCareTaskDto = class CreateCareTaskDto extends (0, _zoddto.createZodDto)(CreateCareTaskSchema) {
};

//# sourceMappingURL=care-coordination.dto.js.map