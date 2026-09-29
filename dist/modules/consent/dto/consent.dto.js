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
    get GrantConsentDto () {
        return GrantConsentDto;
    },
    get GrantConsentSchema () {
        return GrantConsentSchema;
    },
    get ListConsentRecordsQueryDto () {
        return ListConsentRecordsQueryDto;
    },
    get ListConsentRecordsQuerySchema () {
        return ListConsentRecordsQuerySchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const ListConsentRecordsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    consentType: _zod.z.enum([
        'terms_of_use',
        'privacy_notice',
        'clinical_treatment',
        'record_sharing'
    ]).optional(),
    revoked: _zod.z.coerce.boolean().optional()
});
let ListConsentRecordsQueryDto = class ListConsentRecordsQueryDto extends (0, _zoddto.createZodDto)(ListConsentRecordsQuerySchema) {
};
const GrantConsentSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    consentType: _zod.z.enum([
        'terms_of_use',
        'privacy_notice',
        'clinical_treatment',
        'record_sharing'
    ]),
    documentVersion: _zod.z.string().min(1).max(50),
    channel: _zod.z.string().max(50).default('app')
});
let GrantConsentDto = class GrantConsentDto extends (0, _zoddto.createZodDto)(GrantConsentSchema) {
};

//# sourceMappingURL=consent.dto.js.map