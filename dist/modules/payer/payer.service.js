"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PayerService", {
    enumerable: true,
    get: function() {
        return PayerService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
const _auditservice = require("../audit/audit.service");
const _payeradapterregistry = require("./adapters/payer-adapter.registry");
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
let PayerService = class PayerService {
    /**
   * Live payers only, in `displayOrder` — the field a product decision (e.g. "list LifeCome HMO
   * first") lives in, never in code (blueprint §9.1, §21).
   */ async listParticipatingPayers() {
        return this.db.select().from(_schema.payers).where((0, _drizzleorm.eq)(_schema.payers.isLive, true)).orderBy((0, _drizzleorm.asc)(_schema.payers.displayOrder));
    }
    async verifyMembership(patientId, payerCode, memberId) {
        const payer = await this.getLivePayerByCode(payerCode);
        const adapter = this.registry.get(payerCode);
        const result = await adapter.verifyMember({
            payerCode,
            memberId,
            patientDateOfBirth: ''
        });
        await this.audit.record({
            actorType: 'patient',
            actorId: patientId,
            action: 'payer_decision',
            resourceType: 'membership_verification',
            resourceId: `${payerCode}:${memberId}`,
            metadata: {
                status: result.status
            }
        });
        if (result.status !== 'verified') {
            throw new _appexception.AppException('MEMBERSHIP_NOT_VERIFIED', `Your membership could not be verified (${result.status}).`, 422);
        }
        const [membership] = await this.db.insert(_schema.memberships).values({
            patientId,
            payerId: payer.id,
            memberId,
            planId: result.planId,
            verifiedAt: new Date()
        }).returning();
        return membership;
    }
    async getLivePayerByCode(code) {
        const [payer] = await this.db.select().from(_schema.payers).where((0, _drizzleorm.eq)(_schema.payers.code, code));
        if (!payer || !payer.isLive) {
            throw new _appexception.AppException('PAYER_NOT_AVAILABLE', 'This payer is not currently available. You can pay directly instead.', 422);
        }
        return payer;
    }
    constructor(db, registry, audit){
        this.db = db;
        this.registry = registry;
        this.audit = audit;
    }
};
PayerService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _payeradapterregistry.PayerAdapterRegistry === "undefined" ? Object : _payeradapterregistry.PayerAdapterRegistry,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], PayerService);

//# sourceMappingURL=payer.service.js.map