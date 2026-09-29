"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsentController", {
    enumerable: true,
    get: function() {
        return ConsentController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
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
let ConsentController = class ConsentController {
    grant(body) {
        return this.consent.grant(body);
    }
    revoke(id) {
        return this.consent.revoke(id);
    }
    list(patientId) {
        return this.consent.list(patientId);
    }
    constructor(consent){
        this.consent = consent;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _consentdto.GrantConsentDto === "undefined" ? Object : _consentdto.GrantConsentDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ConsentController.prototype, "grant", null);
_ts_decorate([
    (0, _common.Post)(':id/revoke'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ConsentController.prototype, "revoke", null);
_ts_decorate([
    (0, _common.Get)('patients/:patientId'),
    _ts_param(0, (0, _common.Param)('patientId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ConsentController.prototype, "list", null);
ConsentController = _ts_decorate([
    (0, _swagger.ApiTags)('consent'),
    (0, _common.Controller)('consent'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _consentservice.ConsentService === "undefined" ? Object : _consentservice.ConsentService
    ])
], ConsentController);

//# sourceMappingURL=consent.controller.js.map