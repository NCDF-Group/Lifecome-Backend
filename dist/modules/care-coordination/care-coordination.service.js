"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CareCoordinationService", {
    enumerable: true,
    get: function() {
        return CareCoordinationService;
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
let CareCoordinationService = class CareCoordinationService {
    constructor(db){
        this.db = db;
    }
    async create(input) {
        const [task] = await this.db.insert(_schema.careTasks).values({
            ...input,
            dueAt: input.dueAt ? new Date(input.dueAt) : undefined
        }).returning();
        return task;
    }
    listForPatient(patientId) {
        return this.db.select().from(_schema.careTasks).where((0, _drizzleorm.eq)(_schema.careTasks.patientId, patientId));
    }
    listForProvider(providerId) {
        return this.db.select().from(_schema.careTasks).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.careTasks.assignedToProviderId, providerId), (0, _drizzleorm.eq)(_schema.careTasks.status, 'open')));
    }
    async complete(id) {
        const [updated] = await this.db.update(_schema.careTasks).set({
            status: 'done',
            completedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.careTasks.id, id)).returning();
        if (!updated) throw new _appexception.NotFoundAppException('Care task');
        return updated;
    }
};
CareCoordinationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], CareCoordinationService);

//# sourceMappingURL=care-coordination.service.js.map