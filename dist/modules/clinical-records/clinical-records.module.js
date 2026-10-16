"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClinicalRecordsModule", {
    enumerable: true,
    get: function() {
        return ClinicalRecordsModule;
    }
});
const _common = require("@nestjs/common");
const _auditmodule = require("../audit/audit.module");
const _patientmodule = require("../patient/patient.module");
const _clinicalrecordscontroller = require("./clinical-records.controller");
const _clinicalrecordsservice = require("./clinical-records.service");
const _patientrecordscontroller = require("./patient-records.controller");
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
let ClinicalRecordsModule = class ClinicalRecordsModule {
};
ClinicalRecordsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _auditmodule.AuditModule,
            _patientmodule.PatientModule
        ],
        controllers: [
            _clinicalrecordscontroller.ClinicalRecordsController,
            _patientrecordscontroller.PatientRecordsController
        ],
        providers: [
            _clinicalrecordsservice.ClinicalRecordsService
        ],
        exports: [
            _clinicalrecordsservice.ClinicalRecordsService
        ]
    })
], ClinicalRecordsModule);

//# sourceMappingURL=clinical-records.module.js.map