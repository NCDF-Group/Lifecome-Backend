"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsultationModule", {
    enumerable: true,
    get: function() {
        return ConsultationModule;
    }
});
const _common = require("@nestjs/common");
const _consultationcontroller = require("./consultation.controller");
const _consultationservice = require("./consultation.service");
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
let ConsultationModule = class ConsultationModule {
};
ConsultationModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _consultationcontroller.ConsultationController
        ],
        providers: [
            _consultationservice.ConsultationService
        ],
        exports: [
            _consultationservice.ConsultationService
        ]
    })
], ConsultationModule);

//# sourceMappingURL=consultation.module.js.map