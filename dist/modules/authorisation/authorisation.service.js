"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthorisationService", {
    enumerable: true,
    get: function() {
        return AuthorisationService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
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
let AuthorisationService = class AuthorisationService {
    async request(input) {
        const [eligibilityCheck] = await this.db.select().from(_schema.eligibilityChecks).where((0, _drizzleorm.eq)(_schema.eligibilityChecks.id, input.eligibilityCheckId));
        if (!eligibilityCheck) throw new _appexception.NotFoundAppException('Eligibility check');
        const [membership] = await this.db.select().from(_schema.memberships).where((0, _drizzleorm.eq)(_schema.memberships.id, eligibilityCheck.membershipId));
        const [payer] = await this.db.select().from(_schema.payers).where((0, _drizzleorm.eq)(_schema.payers.id, membership.payerId));
        const adapter = this.registry.get(payer.code);
        const result = await adapter.requestAuthorisation({
            payerCode: payer.code,
            memberId: membership.memberId,
            clinicalServiceCode: input.clinicalServiceCode,
            providerId: input.providerId,
            appointmentId: input.appointmentId
        });
        const [authorisation] = await this.db.insert(_schema.authorisations).values({
            eligibilityCheckId: input.eligibilityCheckId,
            payerId: payer.id,
            status: result.status,
            payerReference: result.payerReference,
            infoRequested: result.infoRequested,
            decidedAt: result.status === 'pending' ? null : new Date()
        }).returning();
        await this.audit.record({
            actorType: 'patient',
            actorId: membership.patientId,
            action: 'payer_decision',
            resourceType: 'authorisation',
            resourceId: authorisation.id,
            metadata: {
                status: result.status
            }
        });
        return authorisation;
    }
    /** Re-polls the payer for a pending authorisation and persists any change in status. */ async refreshStatus(authorisationId) {
        const [authorisation] = await this.db.select().from(_schema.authorisations).where((0, _drizzleorm.eq)(_schema.authorisations.id, authorisationId));
        if (!authorisation) throw new _appexception.NotFoundAppException('Authorisation');
        if (authorisation.status !== 'pending' || !authorisation.payerReference) {
            return authorisation;
        }
        const [payer] = await this.db.select().from(_schema.payers).where((0, _drizzleorm.eq)(_schema.payers.id, authorisation.payerId));
        const adapter = this.registry.get(payer.code);
        const result = await adapter.getAuthorisationStatus(authorisation.payerReference);
        const [updated] = await this.db.update(_schema.authorisations).set({
            status: result.status,
            decidedAt: result.status === 'pending' ? null : new Date()
        }).where((0, _drizzleorm.eq)(_schema.authorisations.id, authorisationId)).returning();
        return updated;
    }
    constructor(db, registry, audit){
        this.db = db;
        this.registry = registry;
        this.audit = audit;
    }
};
AuthorisationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _payeradapterregistry.PayerAdapterRegistry === "undefined" ? Object : _payeradapterregistry.PayerAdapterRegistry,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], AuthorisationService);

//# sourceMappingURL=authorisation.service.js.map