"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BookingAdminController", {
    enumerable: true,
    get: function() {
        return BookingAdminController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _bookingservice = require("./booking.service");
const _bookingdto = require("./dto/booking.dto");
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
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let BookingAdminController = class BookingAdminController {
    list(query) {
        return this.booking.adminList(query);
    }
    get(id) {
        return this.booking.adminGet(id);
    }
    constructor(booking){
        this.booking = booking;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bookingdto.ListAppointmentsQueryDto === "undefined" ? Object : _bookingdto.ListAppointmentsQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], BookingAdminController.prototype, "list", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], BookingAdminController.prototype, "get", null);
BookingAdminController = _ts_decorate([
    (0, _swagger.ApiTags)('booking'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin/bookings'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bookingservice.BookingService === "undefined" ? Object : _bookingservice.BookingService
    ])
], BookingAdminController);

//# sourceMappingURL=booking-admin.controller.js.map