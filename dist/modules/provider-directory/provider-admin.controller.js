"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProviderAdminController", {
    enumerable: true,
    get: function() {
        return ProviderAdminController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _providerdto = require("./dto/provider.dto");
const _providerdirectoryservice = require("./provider-directory.service");
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
let ProviderAdminController = class ProviderAdminController {
    list(query) {
        return this.directory.adminList(query);
    }
    get(id) {
        return this.directory.getById(id);
    }
    updateNetworkStatus(id, body) {
        return this.directory.setNetworkStatus(id, body.networkStatus);
    }
    constructor(directory){
        this.directory = directory;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _providerdto.ListProvidersAdminQueryDto === "undefined" ? Object : _providerdto.ListProvidersAdminQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ProviderAdminController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ProviderAdminController.prototype, "get", null);
_ts_decorate([
    (0, _commonauthmodule.Roles)('platform_administrator', 'clinical_administrator'),
    (0, _common.Patch)(':id/network-status'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _providerdto.UpdateProviderNetworkStatusDto === "undefined" ? Object : _providerdto.UpdateProviderNetworkStatusDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ProviderAdminController.prototype, "updateNetworkStatus", null);
ProviderAdminController = _ts_decorate([
    (0, _swagger.ApiTags)('provider-directory'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin/providers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _providerdirectoryservice.ProviderDirectoryService === "undefined" ? Object : _providerdirectoryservice.ProviderDirectoryService
    ])
], ProviderAdminController);

//# sourceMappingURL=provider-admin.controller.js.map