"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HealthController", {
    enumerable: true,
    get: function() {
        return HealthController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _terminus = require("@nestjs/terminus");
const _databasehealth = require("./database.health");
const _redishealth = require("./redis.health");
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
let HealthController = class HealthController {
    constructor(health, database, redis){
        this.health = health;
        this.database = database;
        this.redis = redis;
    }
    /** Liveness: is the process up? No dependency calls — used for restart decisions. */ live() {
        return {
            status: 'ok'
        };
    }
    /** Readiness: can this instance actually serve traffic? Used to gate load-balancer routing. */ ready() {
        return this.health.check([
            ()=>this.database.check(),
            ()=>this.redis.check()
        ]);
    }
};
_ts_decorate([
    (0, _common.Get)('live'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Object)
], HealthController.prototype, "live", null);
_ts_decorate([
    (0, _common.Get)('ready'),
    (0, _terminus.HealthCheck)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], HealthController.prototype, "ready", null);
HealthController = _ts_decorate([
    (0, _swagger.ApiTags)('health'),
    (0, _common.Controller)('health'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _terminus.HealthCheckService === "undefined" ? Object : _terminus.HealthCheckService,
        typeof _databasehealth.DatabaseHealthIndicator === "undefined" ? Object : _databasehealth.DatabaseHealthIndicator,
        typeof _redishealth.RedisHealthIndicator === "undefined" ? Object : _redishealth.RedisHealthIndicator
    ])
], HealthController);

//# sourceMappingURL=health.controller.js.map