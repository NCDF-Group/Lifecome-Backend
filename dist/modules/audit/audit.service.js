"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuditService", {
    enumerable: true,
    get: function() {
        return AuditService;
    }
});
const _nodecrypto = require("node:crypto");
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
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
let AuditService = class AuditService {
    async record(input) {
        const [last] = await this.db.select({
            hash: _schema.auditEvents.hash
        }).from(_schema.auditEvents).orderBy((0, _drizzleorm.desc)(_schema.auditEvents.occurredAt)).limit(1);
        const previousHash = last?.hash ?? null;
        const metadata = input.metadata ?? {};
        const hash = (0, _nodecrypto.createHash)('sha256').update(JSON.stringify({
            previousHash,
            ...input,
            metadata
        })).digest('hex');
        await this.db.insert(_schema.auditEvents).values({
            actorType: input.actorType,
            actorId: input.actorId,
            action: input.action,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            correlationId: input.correlationId,
            metadata,
            previousHash,
            hash
        });
    }
    /**
   * `/admin/audit-events` — the "Audit log" page in the operations console. Read-only, same as
   * every other method here: nothing in this service ever updates or deletes a row.
   */ async list(query) {
        const conditions = [];
        if (query.actorType) conditions.push((0, _drizzleorm.eq)(_schema.auditEvents.actorType, query.actorType));
        if (query.resourceType) conditions.push((0, _drizzleorm.eq)(_schema.auditEvents.resourceType, query.resourceType));
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.auditEvents).where(where);
        const items = await this.db.select().from(_schema.auditEvents).where(where).orderBy((0, _drizzleorm.desc)(_schema.auditEvents.occurredAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    constructor(db){
        this.db = db;
    }
};
AuditService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], AuditService);

//# sourceMappingURL=audit.service.js.map