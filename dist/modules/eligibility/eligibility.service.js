"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EligibilityService", {
    enumerable: true,
    get: function() {
        return EligibilityService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
const _auditservice = require("../audit/audit.service");
const _payeradapterregistry = require("../payer/adapters/payer-adapter.registry");
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
let EligibilityService = class EligibilityService {
    async check(membershipId, clinicalServiceCode) {
        const [membership] = await this.db.select().from(_schema.memberships).where((0, _drizzleorm.eq)(_schema.memberships.id, membershipId));
        if (!membership) throw new _appexception.NotFoundAppException('Membership');
        const [payer] = await this.db.select().from(_schema.payers).where((0, _drizzleorm.eq)(_schema.payers.id, membership.payerId));
        const [service] = await this.db.select().from(_schema.clinicalServices).where((0, _drizzleorm.eq)(_schema.clinicalServices.code, clinicalServiceCode));
        if (!service) throw new _appexception.NotFoundAppException('Clinical service');
        const adapter = this.registry.get(payer.code);
        const result = await adapter.checkEligibility({
            payerCode: payer.code,
            memberId: membership.memberId,
            planId: membership.planId ?? undefined,
            clinicalServiceCode,
            date: new Date().toISOString().slice(0, 10)
        });
        await this.audit.record({
            actorType: 'patient',
            actorId: membership.patientId,
            action: 'payer_decision',
            resourceType: 'eligibility_check',
            resourceId: membershipId,
            metadata: {
                clinicalServiceCode,
                status: result.status
            }
        });
        const [check] = await this.db.insert(_schema.eligibilityChecks).values({
            membershipId,
            clinicalServiceId: service.id,
            status: result.status,
            coPayKobo: result.coPayKobo?.toString(),
            rawResponse: result.raw ?? {}
        }).returning();
        return check;
    }
    /** `/admin/eligibility-checks` — the "Eligibility" page in the operations console. */ async adminList(query) {
        const where = query.status ? (0, _drizzleorm.eq)(_schema.eligibilityChecks.status, query.status) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.eligibilityChecks).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.eligibilityChecks),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`,
            payerName: _schema.payers.name,
            serviceName: _schema.clinicalServices.name
        }).from(_schema.eligibilityChecks).innerJoin(_schema.memberships, (0, _drizzleorm.eq)(_schema.eligibilityChecks.membershipId, _schema.memberships.id)).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.memberships.patientId, _schema.patients.id)).innerJoin(_schema.payers, (0, _drizzleorm.eq)(_schema.memberships.payerId, _schema.payers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.eligibilityChecks.clinicalServiceId, _schema.clinicalServices.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.eligibilityChecks.checkedAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    constructor(db, registry, audit){
        this.db = db;
        this.registry = registry;
        this.audit = audit;
    }
};
EligibilityService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _payeradapterregistry.PayerAdapterRegistry === "undefined" ? Object : _payeradapterregistry.PayerAdapterRegistry,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], EligibilityService);

//# sourceMappingURL=eligibility.service.js.map