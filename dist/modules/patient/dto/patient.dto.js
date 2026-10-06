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
    get CreatePatientProfileDto () {
        return CreatePatientProfileDto;
    },
    get CreatePatientProfileSchema () {
        return CreatePatientProfileSchema;
    },
    get ListPatientsQueryDto () {
        return ListPatientsQueryDto;
    },
    get ListPatientsQuerySchema () {
        return ListPatientsQuerySchema;
    },
    get PatchMyProfileDto () {
        return PatchMyProfileDto;
    },
    get PatchMyProfileSchema () {
        return PatchMyProfileSchema;
    },
    get UpdatePatientProfileDto () {
        return UpdatePatientProfileDto;
    },
    get UpdatePatientProfileSchema () {
        return UpdatePatientProfileSchema;
    },
    get UpsertMyProfileDto () {
        return UpsertMyProfileDto;
    },
    get UpsertMyProfileSchema () {
        return UpsertMyProfileSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const ListPatientsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    search: _zod.z.string().min(1).max(200).optional()
});
let ListPatientsQueryDto = class ListPatientsQueryDto extends (0, _zoddto.createZodDto)(ListPatientsQuerySchema) {
};
const CreatePatientProfileSchema = _zod.z.object({
    userAccountId: _zod.z.uuid(),
    firstName: _zod.z.string().min(1).max(100),
    lastName: _zod.z.string().min(1).max(100),
    dateOfBirth: _zod.z.iso.date(),
    sex: _zod.z.string().max(30).optional(),
    city: _zod.z.string().max(100).optional(),
    state: _zod.z.string().max(100).optional(),
    /** ISO 3166-1 alpha-2 — the UK is `GB`, not `UK`. Omitted means `NG` (the column default). */ country: _zod.z.enum([
        'NG',
        'GB'
    ]).optional()
});
let CreatePatientProfileDto = class CreatePatientProfileDto extends (0, _zoddto.createZodDto)(CreatePatientProfileSchema) {
};
const UpdatePatientProfileSchema = CreatePatientProfileSchema.partial().omit({
    userAccountId: true
});
let UpdatePatientProfileDto = class UpdatePatientProfileDto extends (0, _zoddto.createZodDto)(UpdatePatientProfileSchema) {
};
const UpsertMyProfileSchema = CreatePatientProfileSchema.omit({
    userAccountId: true
});
let UpsertMyProfileDto = class UpsertMyProfileDto extends (0, _zoddto.createZodDto)(UpsertMyProfileSchema) {
};
const PatchMyProfileSchema = UpsertMyProfileSchema.partial();
let PatchMyProfileDto = class PatchMyProfileDto extends (0, _zoddto.createZodDto)(PatchMyProfileSchema) {
};

//# sourceMappingURL=patient.dto.js.map