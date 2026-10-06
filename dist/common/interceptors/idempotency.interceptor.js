"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdempotencyInterceptor", {
    enumerable: true,
    get: function() {
        return IdempotencyInterceptor;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _rxjs = require("rxjs");
const _operators = require("rxjs/operators");
const _appexception = require("../errors/app-exception");
const _redismodule = require("../../queue/redis.module");
const _idempotentdecorator = require("./idempotent.decorator");
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
const HEADER = 'idempotency-key';
const RESULT_TTL_SECONDS = 60 * 60 * 24; // keep a replayable result for 24h
const LOCK_TTL_SECONDS = 30; // a request should not legitimately take longer than this
let IdempotencyInterceptor = class IdempotencyInterceptor {
    intercept(context, next) {
        const required = this.reflector.get(_idempotentdecorator.IDEMPOTENT_KEY, context.getHandler());
        if (!required) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const key = request.headers[HEADER];
        if (typeof key !== 'string' || key.trim().length === 0) {
            throw new _appexception.AppException(_appexception.CommonErrorCodes.IDEMPOTENCY_KEY_REQUIRED, `This request must include an '${HEADER}' header.`);
        }
        // Scoped to the caller: a key is only ever replayed for the same signed-in patient/staff member,
        // so one person guessing or reusing another's key can never be handed that person's response.
        const caller = request;
        const subject = caller.patientAccount?.sub ?? caller.staff?.sub ?? 'anonymous';
        const redisKey = `idempotency:${subject}:${request.routeOptions?.url ?? request.url}:${key}`;
        return (0, _rxjs.from)(this.redis.get(redisKey)).pipe((0, _operators.switchMap)((cached)=>{
            if (cached === 'processing') {
                throw new _appexception.AppException(_appexception.CommonErrorCodes.IDEMPOTENT_REQUEST_IN_PROGRESS, 'A request with this idempotency key is already being processed. Please wait and try again.', 409);
            }
            if (cached) {
                return (0, _rxjs.of)(JSON.parse(cached));
            }
            return (0, _rxjs.from)(this.redis.set(redisKey, 'processing', 'EX', LOCK_TTL_SECONDS, 'NX')).pipe((0, _operators.switchMap)(()=>next.handle().pipe((0, _operators.tap)({
                    next: (result)=>{
                        void this.redis.set(redisKey, JSON.stringify(result ?? null), 'EX', RESULT_TTL_SECONDS);
                    },
                    error: ()=>{
                        void this.redis.del(redisKey);
                    }
                }))));
        }));
    }
    constructor(reflector, redis){
        this.reflector = reflector;
        this.redis = redis;
    }
};
IdempotencyInterceptor = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(1, (0, _common.Inject)(_redismodule.REDIS_CLIENT)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector,
        typeof Redis === "undefined" ? Object : Redis
    ])
], IdempotencyInterceptor);

//# sourceMappingURL=idempotency.interceptor.js.map