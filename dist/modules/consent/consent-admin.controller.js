"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsentAdminController", {
    enumerable: true,
    get: function() {
        return ConsentAdminController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _consentservice = require("./consent.service");
const _consentdto = require("./dto/consent.dto");
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
let ConsentAdminController = class ConsentAdminController {
    constructor(consent){
        this.consent = consent;
    }
    list(query) {
        return this.consent.adminList(query);
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _consentdto.ListConsentRecordsQueryDto === "undefined" ? Object : _consentdto.ListConsentRecordsQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], ConsentAdminController.prototype, "list", null);
ConsentAdminController = _ts_decorate([
    (0, _swagger.ApiTags)('consent'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin/consent'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _consentservice.ConsentService === "undefined" ? Object : _consentservice.ConsentService
    ])
], ConsentAdminController);

//# sourceMappingURL=consent-admin.controller.js.map