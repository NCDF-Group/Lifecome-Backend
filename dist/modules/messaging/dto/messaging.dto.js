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
    get CreateThreadDto () {
        return CreateThreadDto;
    },
    get CreateThreadSchema () {
        return CreateThreadSchema;
    },
    get SendMessageDto () {
        return SendMessageDto;
    },
    get SendMessageSchema () {
        return SendMessageSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateThreadSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    subject: _zod.z.string().max(200).optional()
});
let CreateThreadDto = class CreateThreadDto extends (0, _zoddto.createZodDto)(CreateThreadSchema) {
};
const SendMessageSchema = _zod.z.object({
    senderType: _zod.z.enum([
        'patient',
        'care_team'
    ]),
    senderId: _zod.z.uuid(),
    body: _zod.z.string().min(1).max(4000)
});
let SendMessageDto = class SendMessageDto extends (0, _zoddto.createZodDto)(SendMessageSchema) {
};

//# sourceMappingURL=messaging.dto.js.map