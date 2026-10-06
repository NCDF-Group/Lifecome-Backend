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
    get CreateMyThreadDto () {
        return CreateMyThreadDto;
    },
    get CreateMyThreadSchema () {
        return CreateMyThreadSchema;
    },
    get ListThreadsAdminQueryDto () {
        return ListThreadsAdminQueryDto;
    },
    get ListThreadsAdminQuerySchema () {
        return ListThreadsAdminQuerySchema;
    },
    get MessageTopicSchema () {
        return MessageTopicSchema;
    },
    get SendMessageDto () {
        return SendMessageDto;
    },
    get SendMessageSchema () {
        return SendMessageSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const MessageTopicSchema = _zod.z.enum([
    'booking_payments',
    'online_appointment',
    'clinic_visit',
    'follow_up'
]);
const CreateMyThreadSchema = _zod.z.object({
    topic: MessageTopicSchema,
    body: _zod.z.string().trim().min(1).max(4000)
});
let CreateMyThreadDto = class CreateMyThreadDto extends (0, _zoddto.createZodDto)(CreateMyThreadSchema) {
};
const SendMessageSchema = _zod.z.object({
    body: _zod.z.string().trim().min(1).max(4000)
});
let SendMessageDto = class SendMessageDto extends (0, _zoddto.createZodDto)(SendMessageSchema) {
};
const ListThreadsAdminQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    topic: MessageTopicSchema.optional()
});
let ListThreadsAdminQueryDto = class ListThreadsAdminQueryDto extends (0, _zoddto.createZodDto)(ListThreadsAdminQuerySchema) {
};

//# sourceMappingURL=messaging.dto.js.map