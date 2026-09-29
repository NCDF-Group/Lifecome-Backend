"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminLocationsService", {
    enumerable: true,
    get: function() {
        return AdminLocationsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
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
let AdminLocationsService = class AdminLocationsService {
    constructor(db){
        this.db = db;
    }
    async getOverview() {
        const [patientRows, providerRows, [{ unregisteredPatients }], [{ unregisteredProviders }]] = await Promise.all([
            this.db.select({
                city: _schema.patients.city,
                state: _schema.patients.state,
                total: (0, _drizzleorm.count)()
            }).from(_schema.patients).where((0, _drizzleorm.isNotNull)(_schema.patients.city)).groupBy(_schema.patients.city, _schema.patients.state),
            this.db.select({
                city: _schema.providers.city,
                state: _schema.providers.state,
                total: (0, _drizzleorm.count)()
            }).from(_schema.providers).where((0, _drizzleorm.isNotNull)(_schema.providers.city)).groupBy(_schema.providers.city, _schema.providers.state),
            this.db.select({
                unregisteredPatients: (0, _drizzleorm.count)()
            }).from(_schema.patients).where((0, _drizzleorm.isNull)(_schema.patients.city)),
            this.db.select({
                unregisteredProviders: (0, _drizzleorm.count)()
            }).from(_schema.providers).where((0, _drizzleorm.isNull)(_schema.providers.city))
        ]);
        const byKey = new Map();
        const keyOf = (city, state)=>`${city}|${state ?? ''}`;
        for (const row of patientRows){
            if (!row.city) continue;
            const key = keyOf(row.city, row.state);
            const existing = byKey.get(key) ?? {
                city: row.city,
                state: row.state ?? '',
                patientCount: 0,
                providerCount: 0
            };
            existing.patientCount += row.total;
            byKey.set(key, existing);
        }
        for (const row of providerRows){
            if (!row.city) continue;
            const key = keyOf(row.city, row.state);
            const existing = byKey.get(key) ?? {
                city: row.city,
                state: row.state ?? '',
                patientCount: 0,
                providerCount: 0
            };
            existing.providerCount += row.total;
            byKey.set(key, existing);
        }
        const locations = [
            ...byKey.values()
        ].sort((a, b)=>b.patientCount + b.providerCount - (a.patientCount + a.providerCount));
        return {
            locations,
            unregistered: {
                patients: unregisteredPatients,
                providers: unregisteredProviders
            }
        };
    }
};
AdminLocationsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], AdminLocationsService);

//# sourceMappingURL=admin-locations.service.js.map