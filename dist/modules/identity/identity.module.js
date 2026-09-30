"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdentityModule", {
    enumerable: true,
    get: function() {
        return IdentityModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _jwt = require("@nestjs/jwt");
const _configuration = require("../../common/config/configuration");
const _emailmodule = require("../../common/email/email.module");
const _identitycontroller = require("./identity.controller");
const _identityservice = require("./identity.service");
const _patientjwtauthguard = require("./patient-jwt-auth.guard");
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
let IdentityModule = class IdentityModule {
};
IdentityModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _emailmodule.EmailModule,
            // Module-scoped, so JwtService resolves to this SESSION_JWT_SECRET-signed instance here
            // (and in PatientJwtAuthGuard) rather than CommonAuthModule's global, staff-secret one.
            _jwt.JwtModule.registerAsync({
                imports: [
                    _config.ConfigModule
                ],
                inject: [
                    _configuration.AppConfigService
                ],
                useFactory: (config)=>({
                        secret: config.sessionJwtSecret,
                        signOptions: {
                            expiresIn: '30d'
                        }
                    })
            })
        ],
        controllers: [
            _identitycontroller.IdentityController
        ],
        providers: [
            _identityservice.IdentityService,
            _patientjwtauthguard.PatientJwtAuthGuard
        ],
        exports: [
            _identityservice.IdentityService,
            _patientjwtauthguard.PatientJwtAuthGuard
        ]
    })
], IdentityModule);

//# sourceMappingURL=identity.module.js.map