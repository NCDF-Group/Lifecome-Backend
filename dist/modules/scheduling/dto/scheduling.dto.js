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
    get CreateSlotDto () {
        return CreateSlotDto;
    },
    get CreateSlotSchema () {
        return CreateSlotSchema;
    },
    get HoldSlotDto () {
        return HoldSlotDto;
    },
    get HoldSlotSchema () {
        return HoldSlotSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateSlotSchema = _zod.z.object({
    providerId: _zod.z.uuid(),
    startsAt: _zod.z.iso.datetime(),
    durationMinutes: _zod.z.number().int().positive().max(240).default(30)
});
let CreateSlotDto = class CreateSlotDto extends (0, _zoddto.createZodDto)(CreateSlotSchema) {
};
const HoldSlotSchema = _zod.z.object({
    slotId: _zod.z.uuid()
});
let HoldSlotDto = class HoldSlotDto extends (0, _zoddto.createZodDto)(HoldSlotSchema) {
};

//# sourceMappingURL=scheduling.dto.js.map