"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProviderDirectoryController", {
    enumerable: true,
    get: function() {
        return ProviderDirectoryController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
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
let ProviderDirectoryController = class ProviderDirectoryController {
    constructor(directory){
        this.directory = directory;
    }
    /** View 11 — Find a Doctor. */ list(query) {
        return this.directory.list({
            specialty: query.specialty
        });
    }
    /** View 12 — Doctor Profile. */ get(id) {
        return this.directory.getById(id);
    }
    /** Provider onboarding (operations console, once built). */ create(body) {
        return this.directory.create(body);
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _providerdto.ListProvidersQueryDto === "undefined" ? Object : _providerdto.ListProvidersQueryDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ProviderDirectoryController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ProviderDirectoryController.prototype, "get", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _providerdto.CreateProviderDto === "undefined" ? Object : _providerdto.CreateProviderDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ProviderDirectoryController.prototype, "create", null);
ProviderDirectoryController = _ts_decorate([
    (0, _swagger.ApiTags)('provider-directory'),
    (0, _common.Controller)('providers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _providerdirectoryservice.ProviderDirectoryService === "undefined" ? Object : _providerdirectoryservice.ProviderDirectoryService
    ])
], ProviderDirectoryController);

//# sourceMappingURL=provider-directory.controller.js.map