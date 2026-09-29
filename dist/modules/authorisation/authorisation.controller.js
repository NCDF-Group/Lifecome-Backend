"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthorisationController", {
    enumerable: true,
    get: function() {
        return AuthorisationController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _idempotentdecorator = require("../../common/interceptors/idempotent.decorator");
const _authorisationservice = require("./authorisation.service");
const _authorisationdto = require("./dto/authorisation.dto");
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
let AuthorisationController = class AuthorisationController {
    request(body) {
        return this.authorisationService.request(body);
    }
    status(id) {
        return this.authorisationService.refreshStatus(id);
    }
    constructor(authorisationService){
        this.authorisationService = authorisationService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authorisationdto.RequestAuthorisationDto === "undefined" ? Object : _authorisationdto.RequestAuthorisationDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], AuthorisationController.prototype, "request", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], AuthorisationController.prototype, "status", null);
AuthorisationController = _ts_decorate([
    (0, _swagger.ApiTags)('authorisation'),
    (0, _common.Controller)('authorisations'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authorisationservice.AuthorisationService === "undefined" ? Object : _authorisationservice.AuthorisationService
    ])
], AuthorisationController);

//# sourceMappingURL=authorisation.controller.js.map