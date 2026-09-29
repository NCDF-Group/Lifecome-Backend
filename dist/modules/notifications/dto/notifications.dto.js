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
    get EnqueueNotificationDto () {
        return EnqueueNotificationDto;
    },
    get EnqueueNotificationSchema () {
        return EnqueueNotificationSchema;
    },
    get ListNotificationLogsQueryDto () {
        return ListNotificationLogsQueryDto;
    },
    get ListNotificationLogsQuerySchema () {
        return ListNotificationLogsQuerySchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const ListNotificationLogsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    channel: _zod.z.enum([
        'sms',
        'email',
        'push',
        'in_app'
    ]).optional(),
    status: _zod.z.enum([
        'queued',
        'sent',
        'failed'
    ]).optional()
});
let ListNotificationLogsQueryDto = class ListNotificationLogsQueryDto extends (0, _zoddto.createZodDto)(ListNotificationLogsQuerySchema) {
};
const EnqueueNotificationSchema = _zod.z.object({
    recipientUserAccountId: _zod.z.uuid(),
    channel: _zod.z.enum([
        'sms',
        'email',
        'push',
        'in_app'
    ]),
    template: _zod.z.string().min(1).max(100),
    data: _zod.z.record(_zod.z.string(), _zod.z.unknown()).default({})
});
let EnqueueNotificationDto = class EnqueueNotificationDto extends (0, _zoddto.createZodDto)(EnqueueNotificationSchema) {
};

//# sourceMappingURL=notifications.dto.js.map