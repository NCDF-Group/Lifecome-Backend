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
    get PaginationQueryDto () {
        return PaginationQueryDto;
    },
    get PaginationQuerySchema () {
        return PaginationQuerySchema;
    },
    get paginate () {
        return paginate;
    }
});
const _zod = require("zod");
const _zoddto = require("../validation/zod-dto");
const PaginationQuerySchema = _zod.z.object({
    page: _zod.z.coerce.number().int().min(1).default(1),
    pageSize: _zod.z.coerce.number().int().min(1).max(100).default(20)
});
let PaginationQueryDto = class PaginationQueryDto extends (0, _zoddto.createZodDto)(PaginationQuerySchema) {
};
function paginate(items, total, page, pageSize) {
    return {
        items,
        total,
        page,
        pageSize
    };
}

//# sourceMappingURL=pagination.dto.js.map