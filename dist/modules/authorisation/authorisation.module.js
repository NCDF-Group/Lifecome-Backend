"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthorisationModule", {
    enumerable: true,
    get: function() {
        return AuthorisationModule;
    }
});
const _common = require("@nestjs/common");
const _auditmodule = require("../audit/audit.module");
const _payermodule = require("../payer/payer.module");
const _authorisationcontroller = require("./authorisation.controller");
const _authorisationservice = require("./authorisation.service");
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
let AuthorisationModule = class AuthorisationModule {
};
AuthorisationModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _payermodule.PayerModule,
            _auditmodule.AuditModule
        ],
        controllers: [
            _authorisationcontroller.AuthorisationController
        ],
        providers: [
            _authorisationservice.AuthorisationService
        ],
        exports: [
            _authorisationservice.AuthorisationService
        ]
    })
], AuthorisationModule);

//# sourceMappingURL=authorisation.module.js.map