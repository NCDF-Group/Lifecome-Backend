"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServiceCatalogueController", {
    enumerable: true,
    get: function() {
        return ServiceCatalogueController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _servicecataloguedto = require("./dto/service-catalogue.dto");
const _servicecatalogueservice = require("./service-catalogue.service");
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
let ServiceCatalogueController = class ServiceCatalogueController {
    constructor(catalogue){
        this.catalogue = catalogue;
    }
    list() {
        return this.catalogue.list();
    }
    create(body) {
        return this.catalogue.create(body);
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ServiceCatalogueController.prototype, "list", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _servicecataloguedto.CreateClinicalServiceDto === "undefined" ? Object : _servicecataloguedto.CreateClinicalServiceDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], ServiceCatalogueController.prototype, "create", null);
ServiceCatalogueController = _ts_decorate([
    (0, _swagger.ApiTags)('service-catalogue'),
    (0, _common.Controller)('clinical-services'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _servicecatalogueservice.ServiceCatalogueService === "undefined" ? Object : _servicecatalogueservice.ServiceCatalogueService
    ])
], ServiceCatalogueController);

//# sourceMappingURL=service-catalogue.controller.js.map