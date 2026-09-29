"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsentModule", {
    enumerable: true,
    get: function() {
        return ConsentModule;
    }
});
const _common = require("@nestjs/common");
const _consentadmincontroller = require("./consent-admin.controller");
const _consentcontroller = require("./consent.controller");
const _consentservice = require("./consent.service");
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
let ConsentModule = class ConsentModule {
};
ConsentModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _consentcontroller.ConsentController,
            _consentadmincontroller.ConsentAdminController
        ],
        providers: [
            _consentservice.ConsentService
        ],
        exports: [
            _consentservice.ConsentService
        ]
    })
], ConsentModule);

//# sourceMappingURL=consent.module.js.map