"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get REDIS_CLIENT () {
        return REDIS_CLIENT;
    },
    get RedisModule () {
        return RedisModule;
    }
});
const _common = require("@nestjs/common");
const _ioredis = require("ioredis");
const _configuration = require("../common/config/configuration");
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
const REDIS_CLIENT = Symbol('REDIS_CLIENT');
let RedisShutdown = class RedisShutdown {
    constructor(redis){
        this.redis = redis;
    }
    async onApplicationShutdown() {
        await this.redis.quit();
    }
};
RedisShutdown = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(REDIS_CLIENT)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _ioredis.Redis === "undefined" ? Object : _ioredis.Redis
    ])
], RedisShutdown);
let RedisModule = class RedisModule {
};
RedisModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        providers: [
            {
                provide: REDIS_CLIENT,
                inject: [
                    _configuration.AppConfigService
                ],
                useFactory: (config)=>new _ioredis.Redis(config.redisUrl, {
                        // BullMQ requires this to be null so it can manage retries itself.
                        maxRetriesPerRequest: null
                    })
            },
            RedisShutdown
        ],
        exports: [
            REDIS_CLIENT
        ]
    })
], RedisModule);

//# sourceMappingURL=redis.module.js.map