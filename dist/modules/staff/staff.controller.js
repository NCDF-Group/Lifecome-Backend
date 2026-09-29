"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StaffController", {
    enumerable: true,
    get: function() {
        return StaffController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _staffdto = require("./dto/staff.dto");
const _staffservice = require("./staff.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let StaffController = class StaffController {
    // The `me` routes are declared before `:id` so `me` is never parsed as an id. Any signed-in staff
    // member can use them on their own account, whatever their role.
    me(staff) {
        return this.staff.getById(staff.sub);
    }
    updateMe(staff, body) {
        return this.staff.update(staff.sub, body);
    }
    changeMyPassword(staff, body) {
        return this.staff.changePassword(staff.sub, body);
    }
    setMyAvatar(staff, body) {
        return this.staff.setAvatar(staff.sub, body);
    }
    removeMyAvatar(staff) {
        return this.staff.removeAvatar(staff.sub);
    }
    create(body) {
        return this.staff.create(body);
    }
    list(query) {
        return this.staff.list(query);
    }
    /** Any signed-in staff member can see a colleague's photo (e.g. in the staff list). */ async getAvatar(id) {
        const avatar = await this.staff.getAvatar(id);
        return new _common.StreamableFile(avatar.image, {
            type: avatar.contentType,
            length: avatar.image.length
        });
    }
    get(id) {
        return this.staff.getById(id);
    }
    update(id, body) {
        return this.staff.update(id, body);
    }
    constructor(staff){
        this.staff = staff;
    }
};
_ts_decorate([
    (0, _common.Get)('me'),
    _ts_param(0, (0, _commonauthmodule.CurrentStaff)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof StaffTokenPayload === "undefined" ? Object : StaffTokenPayload
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "me", null);
_ts_decorate([
    (0, _common.Patch)('me'),
    _ts_param(0, (0, _commonauthmodule.CurrentStaff)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof StaffTokenPayload === "undefined" ? Object : StaffTokenPayload,
        typeof _staffdto.UpdateOwnProfileDto === "undefined" ? Object : _staffdto.UpdateOwnProfileDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "updateMe", null);
_ts_decorate([
    (0, _common.Post)('me/password'),
    (0, _common.HttpCode)(_common.HttpStatus.NO_CONTENT),
    _ts_param(0, (0, _commonauthmodule.CurrentStaff)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof StaffTokenPayload === "undefined" ? Object : StaffTokenPayload,
        typeof _staffdto.ChangeOwnPasswordDto === "undefined" ? Object : _staffdto.ChangeOwnPasswordDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "changeMyPassword", null);
_ts_decorate([
    (0, _common.Put)('me/avatar'),
    _ts_param(0, (0, _commonauthmodule.CurrentStaff)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof StaffTokenPayload === "undefined" ? Object : StaffTokenPayload,
        typeof _staffdto.UploadAvatarDto === "undefined" ? Object : _staffdto.UploadAvatarDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "setMyAvatar", null);
_ts_decorate([
    (0, _common.Delete)('me/avatar'),
    _ts_param(0, (0, _commonauthmodule.CurrentStaff)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof StaffTokenPayload === "undefined" ? Object : StaffTokenPayload
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "removeMyAvatar", null);
_ts_decorate([
    (0, _commonauthmodule.Roles)('platform_administrator'),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _staffdto.CreateStaffDto === "undefined" ? Object : _staffdto.CreateStaffDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _staffdto.ListStaffQueryDto === "undefined" ? Object : _staffdto.ListStaffQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], StaffController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id/avatar'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StaffController.prototype, "getAvatar", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "get", null);
_ts_decorate([
    (0, _commonauthmodule.Roles)('platform_administrator'),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _staffdto.UpdateStaffDto === "undefined" ? Object : _staffdto.UpdateStaffDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], StaffController.prototype, "update", null);
StaffController = _ts_decorate([
    (0, _swagger.ApiTags)('staff'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin/staff'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _staffservice.StaffService === "undefined" ? Object : _staffservice.StaffService
    ])
], StaffController);

//# sourceMappingURL=staff.controller.js.map