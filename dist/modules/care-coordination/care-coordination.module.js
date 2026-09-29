"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CareCoordinationModule", {
    enumerable: true,
    get: function() {
        return CareCoordinationModule;
    }
});
const _common = require("@nestjs/common");
const _carecoordinationcontroller = require("./care-coordination.controller");
const _carecoordinationservice = require("./care-coordination.service");
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
let CareCoordinationModule = class CareCoordinationModule {
};
CareCoordinationModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _carecoordinationcontroller.CareCoordinationController
        ],
        providers: [
            _carecoordinationservice.CareCoordinationService
        ],
        exports: [
            _carecoordinationservice.CareCoordinationService
        ]
    })
], CareCoordinationModule);

//# sourceMappingURL=care-coordination.module.js.map