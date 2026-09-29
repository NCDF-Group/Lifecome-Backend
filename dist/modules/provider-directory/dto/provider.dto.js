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
    get CreateProviderDto () {
        return CreateProviderDto;
    },
    get CreateProviderSchema () {
        return CreateProviderSchema;
    },
    get ListProvidersAdminQueryDto () {
        return ListProvidersAdminQueryDto;
    },
    get ListProvidersAdminQuerySchema () {
        return ListProvidersAdminQuerySchema;
    },
    get ListProvidersQueryDto () {
        return ListProvidersQueryDto;
    },
    get ListProvidersQuerySchema () {
        return ListProvidersQuerySchema;
    },
    get ProviderNetworkStatusSchema () {
        return ProviderNetworkStatusSchema;
    },
    get UpdateProviderNetworkStatusDto () {
        return UpdateProviderNetworkStatusDto;
    },
    get UpdateProviderNetworkStatusSchema () {
        return UpdateProviderNetworkStatusSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const ProviderNetworkStatusSchema = _zod.z.enum([
    'active',
    'suspended',
    'pending_review'
]);
const ListProvidersAdminQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    search: _zod.z.string().min(1).max(200).optional(),
    specialty: _zod.z.string().optional(),
    networkStatus: ProviderNetworkStatusSchema.optional()
});
let ListProvidersAdminQueryDto = class ListProvidersAdminQueryDto extends (0, _zoddto.createZodDto)(ListProvidersAdminQuerySchema) {
};
const UpdateProviderNetworkStatusSchema = _zod.z.object({
    networkStatus: ProviderNetworkStatusSchema
});
let UpdateProviderNetworkStatusDto = class UpdateProviderNetworkStatusDto extends (0, _zoddto.createZodDto)(UpdateProviderNetworkStatusSchema) {
};
const CreateProviderSchema = _zod.z.object({
    displayName: _zod.z.string().min(1).max(200),
    specialty: _zod.z.string().min(1).max(120),
    languages: _zod.z.array(_zod.z.string().min(1)).default([]),
    consultationModes: _zod.z.array(_zod.z.enum([
        'video',
        'audio'
    ])).default([
        'video'
    ]),
    city: _zod.z.string().max(100).optional(),
    state: _zod.z.string().max(100).optional()
});
let CreateProviderDto = class CreateProviderDto extends (0, _zoddto.createZodDto)(CreateProviderSchema) {
};
const ListProvidersQuerySchema = _zod.z.object({
    specialty: _zod.z.string().optional(),
    language: _zod.z.string().optional()
});
let ListProvidersQueryDto = class ListProvidersQueryDto extends (0, _zoddto.createZodDto)(ListProvidersQuerySchema) {
};

//# sourceMappingURL=provider.dto.js.map