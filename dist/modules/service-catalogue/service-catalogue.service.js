"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ServiceCatalogueService", {
    enumerable: true,
    get: function() {
        return ServiceCatalogueService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
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
let ServiceCatalogueService = class ServiceCatalogueService {
    constructor(db){
        this.db = db;
    }
    list() {
        return this.db.select().from(_schema.clinicalServices).where((0, _drizzleorm.eq)(_schema.clinicalServices.isActive, true));
    }
    async getByCode(code) {
        const [service] = await this.db.select().from(_schema.clinicalServices).where((0, _drizzleorm.eq)(_schema.clinicalServices.code, code));
        if (!service) throw new _appexception.NotFoundAppException('Clinical service');
        return service;
    }
    async create(input) {
        const [created] = await this.db.insert(_schema.clinicalServices).values(input).returning();
        return created;
    }
};
ServiceCatalogueService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], ServiceCatalogueService);

//# sourceMappingURL=service-catalogue.service.js.map