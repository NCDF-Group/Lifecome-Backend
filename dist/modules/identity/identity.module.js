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
const _smsmodule = require("../../common/sms/sms.module");
const _identitycontroller = require("./identity.controller");
const _identityservice = require("./identity.service");
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
            _smsmodule.SmsModule
        ],
        controllers: [
            _identitycontroller.IdentityController
        ],
        providers: [
            _identityservice.IdentityService
        ],
        exports: [
            _identityservice.IdentityService
        ]
    })
], IdentityModule);

//# sourceMappingURL=identity.module.js.map