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
    get ChangeOwnPasswordDto () {
        return ChangeOwnPasswordDto;
    },
    get ChangeOwnPasswordSchema () {
        return ChangeOwnPasswordSchema;
    },
    get CreateStaffDto () {
        return CreateStaffDto;
    },
    get CreateStaffSchema () {
        return CreateStaffSchema;
    },
    get ListStaffQueryDto () {
        return ListStaffQueryDto;
    },
    get ListStaffQuerySchema () {
        return ListStaffQuerySchema;
    },
    get MAX_AVATAR_BYTES () {
        return MAX_AVATAR_BYTES;
    },
    get StaffRoleSchema () {
        return StaffRoleSchema;
    },
    get StaffStatusSchema () {
        return StaffStatusSchema;
    },
    get UpdateOwnProfileDto () {
        return UpdateOwnProfileDto;
    },
    get UpdateOwnProfileSchema () {
        return UpdateOwnProfileSchema;
    },
    get UpdateStaffDto () {
        return UpdateStaffDto;
    },
    get UpdateStaffSchema () {
        return UpdateStaffSchema;
    },
    get UploadAvatarDto () {
        return UploadAvatarDto;
    },
    get UploadAvatarSchema () {
        return UploadAvatarSchema;
    }
});
const _zod = require("zod");
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const StaffRoleSchema = _zod.z.enum([
    'platform_administrator',
    'clinical_administrator',
    'hmo_operations',
    'support_agent'
]);
const StaffStatusSchema = _zod.z.enum([
    'active',
    'suspended'
]);
const CreateStaffSchema = _zod.z.object({
    email: _zod.z.email(),
    password: _zod.z.string().min(10).max(200),
    fullName: _zod.z.string().min(1).max(200),
    role: StaffRoleSchema
});
let CreateStaffDto = class CreateStaffDto extends (0, _zoddto.createZodDto)(CreateStaffSchema) {
};
const UpdateStaffSchema = _zod.z.object({
    fullName: _zod.z.string().min(1).max(200).optional(),
    role: StaffRoleSchema.optional(),
    status: StaffStatusSchema.optional()
});
let UpdateStaffDto = class UpdateStaffDto extends (0, _zoddto.createZodDto)(UpdateStaffSchema) {
};
const UpdateOwnProfileSchema = _zod.z.object({
    fullName: _zod.z.string().trim().min(1).max(200)
});
let UpdateOwnProfileDto = class UpdateOwnProfileDto extends (0, _zoddto.createZodDto)(UpdateOwnProfileSchema) {
};
const ChangeOwnPasswordSchema = _zod.z.object({
    currentPassword: _zod.z.string().min(1).max(200),
    newPassword: _zod.z.string().min(10).max(200)
});
let ChangeOwnPasswordDto = class ChangeOwnPasswordDto extends (0, _zoddto.createZodDto)(ChangeOwnPasswordSchema) {
};
const MAX_AVATAR_BYTES = 512 * 1024;
const UploadAvatarSchema = _zod.z.object({
    contentType: _zod.z.enum([
        'image/jpeg',
        'image/png',
        'image/webp'
    ]),
    // base64 is ~4/3 of the byte length; the decoded size is checked again in the service.
    data: _zod.z.base64().max(Math.ceil(MAX_AVATAR_BYTES * 4 / 3) + 4)
});
let UploadAvatarDto = class UploadAvatarDto extends (0, _zoddto.createZodDto)(UploadAvatarSchema) {
};
const ListStaffQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    role: StaffRoleSchema.optional(),
    status: StaffStatusSchema.optional()
});
let ListStaffQueryDto = class ListStaffQueryDto extends (0, _zoddto.createZodDto)(ListStaffQuerySchema) {
};

//# sourceMappingURL=staff.dto.js.map