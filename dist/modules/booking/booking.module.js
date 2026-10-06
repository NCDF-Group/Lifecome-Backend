"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BookingModule", {
    enumerable: true,
    get: function() {
        return BookingModule;
    }
});
const _common = require("@nestjs/common");
const _patientmodule = require("../patient/patient.module");
const _patientnotificationsmodule = require("../patient-notifications/patient-notifications.module");
const _schedulingmodule = require("../scheduling/scheduling.module");
const _bookingadmincontroller = require("./booking-admin.controller");
const _bookingcontroller = require("./booking.controller");
const _bookingservice = require("./booking.service");
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
let BookingModule = class BookingModule {
};
BookingModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _schedulingmodule.SchedulingModule,
            _patientmodule.PatientModule,
            _patientnotificationsmodule.PatientNotificationsModule
        ],
        controllers: [
            _bookingcontroller.BookingController,
            _bookingadmincontroller.BookingAdminController
        ],
        providers: [
            _bookingservice.BookingService
        ],
        exports: [
            _bookingservice.BookingService
        ]
    })
], BookingModule);

//# sourceMappingURL=booking.module.js.map