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
    get CommonAuthModule () {
        return CommonAuthModule;
    },
    get CurrentStaff () {
        return _currentstaffdecorator.CurrentStaff;
    },
    get JwtAuthGuard () {
        return _jwtauthguard.JwtAuthGuard;
    },
    get Roles () {
        return _rolesdecorator.Roles;
    },
    get RolesGuard () {
        return _rolesguard.RolesGuard;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _configmodule = require("../config/config.module");
const _configuration = require("../config/configuration");
const _currentstaffdecorator = require("./current-staff.decorator");
const _jwtauthguard = require("./jwt-auth.guard");
const _rolesguard = require("./roles.guard");
const _rolesdecorator = require("./roles.decorator");
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
let CommonAuthModule = class CommonAuthModule {
};
CommonAuthModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _jwt.JwtModule.registerAsync({
                imports: [
                    _configmodule.ConfigModule
                ],
                inject: [
                    _configuration.AppConfigService
                ],
                useFactory: (config)=>({
                        secret: config.staffJwtSecret,
                        signOptions: {
                            expiresIn: '12h'
                        }
                    })
            })
        ],
        providers: [
            _jwtauthguard.JwtAuthGuard,
            _rolesguard.RolesGuard
        ],
        exports: [
            _jwt.JwtModule,
            _jwtauthguard.JwtAuthGuard,
            _rolesguard.RolesGuard
        ]
    })
], CommonAuthModule);

//# sourceMappingURL=common-auth.module.js.map