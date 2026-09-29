"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsentService", {
    enumerable: true,
    get: function() {
        return ConsentService;
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
let ConsentService = class ConsentService {
    constructor(db){
        this.db = db;
    }
    async grant(input) {
        const [record] = await this.db.insert(_schema.consentRecords).values(input).returning();
        return record;
    }
    async revoke(id) {
        const [updated] = await this.db.update(_schema.consentRecords).set({
            revokedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.consentRecords.id, id)).returning();
        if (!updated) throw new _appexception.NotFoundAppException('Consent record');
        return updated;
    }
    list(patientId) {
        return this.db.select().from(_schema.consentRecords).where((0, _drizzleorm.eq)(_schema.consentRecords.patientId, patientId));
    }
    /** `/admin/consent` — every patient's consent records, not just one. */ async adminList(query) {
        const conditions = [];
        if (query.consentType) conditions.push((0, _drizzleorm.eq)(_schema.consentRecords.consentType, query.consentType));
        if (query.revoked !== undefined) {
            conditions.push(query.revoked ? (0, _drizzleorm.isNotNull)(_schema.consentRecords.revokedAt) : (0, _drizzleorm.isNull)(_schema.consentRecords.revokedAt));
        }
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.consentRecords).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.consentRecords.patientId, _schema.patients.id)).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.consentRecords),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`
        }).from(_schema.consentRecords).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.consentRecords.patientId, _schema.patients.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.consentRecords.grantedAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    async hasActiveConsent(patientId, consentType) {
        const [record] = await this.db.select({
            id: _schema.consentRecords.id
        }).from(_schema.consentRecords).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.consentRecords.patientId, patientId), (0, _drizzleorm.eq)(_schema.consentRecords.consentType, consentType), (0, _drizzleorm.isNull)(_schema.consentRecords.revokedAt))).limit(1);
        return Boolean(record);
    }
};
ConsentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], ConsentService);

//# sourceMappingURL=consent.service.js.map