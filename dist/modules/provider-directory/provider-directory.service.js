"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ProviderDirectoryService", {
    enumerable: true,
    get: function() {
        return ProviderDirectoryService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
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
let ProviderDirectoryService = class ProviderDirectoryService {
    async list(filters) {
        const conditions = [
            (0, _drizzleorm.eq)(_schema.providers.networkStatus, 'active')
        ];
        if (filters.specialty) conditions.push((0, _drizzleorm.eq)(_schema.providers.specialty, filters.specialty));
        return this.db.select().from(_schema.providers).where(conditions.length > 1 ? (0, _drizzleorm.and)(...conditions) : conditions[0]);
    }
    async getById(id) {
        const [provider] = await this.db.select().from(_schema.providers).where((0, _drizzleorm.eq)(_schema.providers.id, id));
        if (!provider) throw new _appexception.NotFoundAppException('Provider');
        return provider;
    }
    async create(input) {
        const [created] = await this.db.insert(_schema.providers).values(input).returning();
        return created;
    }
    /** `/admin/providers` — unlike `list()`, includes suspended/pending-review providers. */ async adminList(query) {
        const conditions = [];
        if (query.networkStatus) conditions.push((0, _drizzleorm.eq)(_schema.providers.networkStatus, query.networkStatus));
        if (query.specialty) conditions.push((0, _drizzleorm.eq)(_schema.providers.specialty, query.specialty));
        if (query.search) conditions.push((0, _drizzleorm.ilike)(_schema.providers.displayName, `%${query.search}%`));
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.providers).where(where);
        const items = await this.db.select().from(_schema.providers).where(where).orderBy((0, _drizzleorm.desc)(_schema.providers.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    async setNetworkStatus(id, networkStatus) {
        await this.getById(id); // 404s early if missing
        const [updated] = await this.db.update(_schema.providers).set({
            networkStatus
        }).where((0, _drizzleorm.eq)(_schema.providers.id, id)).returning();
        return updated;
    }
    constructor(db){
        this.db = db;
    }
};
ProviderDirectoryService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], ProviderDirectoryService);

//# sourceMappingURL=provider-directory.service.js.map