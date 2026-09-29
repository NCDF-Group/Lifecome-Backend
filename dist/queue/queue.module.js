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
    get QUEUE_NAMES () {
        return QUEUE_NAMES;
    },
    get QueueModule () {
        return QueueModule;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _redismodule = require("./redis.module");
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
const QUEUE_NAMES = {
    NOTIFICATIONS: 'notifications',
    RECONCILIATION: 'reconciliation'
};
let QueueModule = class QueueModule {
};
QueueModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _redismodule.RedisModule,
            _bullmq.BullModule.forRootAsync({
                imports: [
                    _redismodule.RedisModule
                ],
                inject: [
                    _redismodule.REDIS_CLIENT
                ],
                useFactory: (connection)=>({
                        connection
                    })
            }),
            _bullmq.BullModule.registerQueue({
                name: QUEUE_NAMES.NOTIFICATIONS
            }, {
                name: QUEUE_NAMES.RECONCILIATION
            })
        ],
        exports: [
            _bullmq.BullModule
        ]
    })
], QueueModule);

//# sourceMappingURL=queue.module.js.map