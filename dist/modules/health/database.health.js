"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DatabaseHealthIndicator", {
    enumerable: true,
    get: function() {
        return DatabaseHealthIndicator;
    }
});
const _common = require("@nestjs/common");
const _terminus = require("@nestjs/terminus");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
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
let DatabaseHealthIndicator = class DatabaseHealthIndicator {
    async check(key = 'database') {
        const indicator = this.indicators.check(key);
        try {
            await this.db.execute((0, _drizzleorm.sql)`select 1`);
            return indicator.up();
        } catch (error) {
            return indicator.down({
                message: error instanceof Error ? error.message : 'unreachable'
            });
        }
    }
    constructor(indicators, db){
        this.indicators = indicators;
        this.db = db;
    }
};
DatabaseHealthIndicator = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _terminus.HealthIndicatorService === "undefined" ? Object : _terminus.HealthIndicatorService,
        typeof Database === "undefined" ? Object : Database
    ])
], DatabaseHealthIndicator);

//# sourceMappingURL=database.health.js.map