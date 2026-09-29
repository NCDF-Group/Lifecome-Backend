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
    get DRIZZLE () {
        return DRIZZLE;
    },
    get DrizzleModule () {
        return DrizzleModule;
    },
    get PG_CLIENT () {
        return PG_CLIENT;
    }
});
const _common = require("@nestjs/common");
const _postgresjs = require("drizzle-orm/postgres-js");
const _postgres = /*#__PURE__*/ _interop_require_default(require("postgres"));
const _configuration = require("../common/config/configuration");
const _schema = /*#__PURE__*/ _interop_require_wildcard(require("./schema"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
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
const DRIZZLE = Symbol('DRIZZLE');
const PG_CLIENT = Symbol('PG_CLIENT');
let PgShutdown = class PgShutdown {
    constructor(sql){
        this.sql = sql;
    }
    async onApplicationShutdown() {
        await this.sql.end({
            timeout: 5
        });
    }
};
PgShutdown = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(PG_CLIENT)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Sql === "undefined" ? Object : Sql
    ])
], PgShutdown);
let DrizzleModule = class DrizzleModule {
};
DrizzleModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        providers: [
            {
                provide: PG_CLIENT,
                inject: [
                    _configuration.AppConfigService
                ],
                useFactory: (config)=>(0, _postgres.default)(config.databaseUrl, {
                        max: 10
                    })
            },
            {
                provide: DRIZZLE,
                inject: [
                    PG_CLIENT
                ],
                useFactory: (sql)=>(0, _postgresjs.drizzle)(sql, {
                        schema: _schema
                    })
            },
            PgShutdown
        ],
        exports: [
            DRIZZLE,
            PG_CLIENT
        ]
    })
], DrizzleModule);

//# sourceMappingURL=client.js.map