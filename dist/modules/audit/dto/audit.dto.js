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
    get ListAuditEventsQueryDto () {
        return ListAuditEventsQueryDto;
    },
    get ListAuditEventsQuerySchema () {
        return ListAuditEventsQuerySchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const ListAuditEventsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    actorType: _zod.z.enum([
        'patient',
        'provider',
        'staff',
        'system'
    ]).optional(),
    resourceType: _zod.z.string().optional()
});
let ListAuditEventsQueryDto = class ListAuditEventsQueryDto extends (0, _zoddto.createZodDto)(ListAuditEventsQuerySchema) {
};

//# sourceMappingURL=audit.dto.js.map