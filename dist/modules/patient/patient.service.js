"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PatientService", {
    enumerable: true,
    get: function() {
        return PatientService;
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
let PatientService = class PatientService {
    async createProfile(input) {
        const [created] = await this.db.insert(_schema.patients).values(input).returning();
        return created;
    }
    async getById(id) {
        const [found] = await this.db.select().from(_schema.patients).where((0, _drizzleorm.eq)(_schema.patients.id, id));
        if (!found) throw new _appexception.NotFoundAppException('Patient');
        return found;
    }
    /** `/admin/patients` — every patient with its account's contact details, searchable by name/email/phone. */ async adminList(query) {
        const conditions = [];
        if (query.search) {
            const term = `%${query.search}%`;
            conditions.push((0, _drizzleorm.or)((0, _drizzleorm.ilike)(_schema.patients.firstName, term), (0, _drizzleorm.ilike)(_schema.patients.lastName, term), (0, _drizzleorm.ilike)(_schema.userAccounts.email, term), (0, _drizzleorm.ilike)(_schema.userAccounts.phoneNumber, term)));
        }
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.patients),
            phoneNumber: _schema.userAccounts.phoneNumber,
            email: _schema.userAccounts.email,
            accountStatus: _schema.userAccounts.status
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.patients.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    /** `/admin/patients/:id` — the joined row a list row links to, not the bare `getById()`. */ async adminGetById(id) {
        const [found] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.patients),
            phoneNumber: _schema.userAccounts.phoneNumber,
            email: _schema.userAccounts.email,
            accountStatus: _schema.userAccounts.status
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where((0, _drizzleorm.eq)(_schema.patients.id, id));
        if (!found) throw new _appexception.NotFoundAppException('Patient');
        return found;
    }
    async getByUserAccountId(userAccountId) {
        const [found] = await this.db.select().from(_schema.patients).where((0, _drizzleorm.eq)(_schema.patients.userAccountId, userAccountId));
        return found;
    }
    async update(id, input) {
        await this.getById(id); // 404s early if missing
        const [updated] = await this.db.update(_schema.patients).set({
            ...input,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.patients.id, id)).returning();
        return updated;
    }
    constructor(db){
        this.db = db;
    }
};
PatientService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], PatientService);

//# sourceMappingURL=patient.service.js.map