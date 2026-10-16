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
    get CreateDependantDto () {
        return CreateDependantDto;
    },
    get CreateDependantSchema () {
        return CreateDependantSchema;
    },
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
    get UpdateDependantDto () {
        return UpdateDependantDto;
    },
    get UpdateDependantSchema () {
        return UpdateDependantSchema;
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
    lastName: _zod.z.string().max(100).optional().nullable().or(_zod.z.literal('')),
    fullName: _zod.z.string().max(200).optional().nullable().or(_zod.z.literal('')),
    dateOfBirth: _zod.z.iso.date(),
    sex: _zod.z.string().max(30).optional(),
    city: _zod.z.string().max(100).optional(),
    state: _zod.z.string().max(100).optional(),
    /** ISO 3166-1 alpha-2 — the UK is `GB`, not `UK`. Omitted means `NG` (the column default). */ country: _zod.z.enum([
        'NG',
        'GB'
    ]).optional(),
    address: _zod.z.string().max(255).optional(),
    bloodGroup: _zod.z.string().max(10).optional(),
    genotype: _zod.z.string().max(10).optional(),
    emergencyContactName: _zod.z.string().max(100).optional(),
    emergencyContactPhone: _zod.z.string().max(40).optional(),
    emergencyContactRelationship: _zod.z.string().max(50).optional()
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
}).extend({
    firstName: _zod.z.string().max(100).optional().nullable().or(_zod.z.literal(''))
});
let UpsertMyProfileDto = class UpsertMyProfileDto extends (0, _zoddto.createZodDto)(UpsertMyProfileSchema) {
};
const PatchMyProfileSchema = UpsertMyProfileSchema.partial();
let PatchMyProfileDto = class PatchMyProfileDto extends (0, _zoddto.createZodDto)(PatchMyProfileSchema) {
};
const CreateDependantSchema = _zod.z.object({
    firstName: _zod.z.string().min(1).max(100),
    lastName: _zod.z.string().min(1).max(100),
    relationship: _zod.z.string().min(1).max(50),
    dateOfBirth: _zod.z.iso.date(),
    gender: _zod.z.string().max(30).optional(),
    bloodGroup: _zod.z.string().max(10).optional(),
    genotype: _zod.z.string().max(10).optional(),
    status: _zod.z.enum([
        'Covered',
        'Approved',
        'Pending'
    ]).default('Covered')
});
let CreateDependantDto = class CreateDependantDto extends (0, _zoddto.createZodDto)(CreateDependantSchema) {
};
const UpdateDependantSchema = CreateDependantSchema.partial();
let UpdateDependantDto = class UpdateDependantDto extends (0, _zoddto.createZodDto)(UpdateDependantSchema) {
};

//# sourceMappingURL=patient.dto.js.map