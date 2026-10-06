"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PayerModule", {
    enumerable: true,
    get: function() {
        return PayerModule;
    }
});
const _common = require("@nestjs/common");
const _auditmodule = require("../audit/audit.module");
const _patientmodule = require("../patient/patient.module");
const _fakepayeradapter = require("./adapters/fake-payer.adapter");
const _payeradapterregistry = require("./adapters/payer-adapter.registry");
const _payercontroller = require("./payer.controller");
const _payerservice = require("./payer.service");
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
let PayerModule = class PayerModule {
};
PayerModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _auditmodule.AuditModule,
            _patientmodule.PatientModule
        ],
        controllers: [
            _payercontroller.PayerController
        ],
        providers: [
            _payerservice.PayerService,
            _payeradapterregistry.PayerAdapterRegistry,
            _fakepayeradapter.FakePayerAdapter
        ],
        exports: [
            _payerservice.PayerService,
            _payeradapterregistry.PayerAdapterRegistry
        ]
    })
], PayerModule);

//# sourceMappingURL=payer.module.js.map