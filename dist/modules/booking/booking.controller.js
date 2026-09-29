"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BookingController", {
    enumerable: true,
    get: function() {
        return BookingController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _idempotentdecorator = require("../../common/interceptors/idempotent.decorator");
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
let BookingController = class BookingController {
    constructor(booking){
        this.booking = booking;
    }
    create(body) {
        return this.booking.create(body);
    }
    get(id) {
        return this.booking.getById(id);
    }
    confirm(id) {
        return this.booking.confirm(id);
    }
    cancel(id) {
        return this.booking.cancel(id);
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bookingdto.CreateAppointmentDto === "undefined" ? Object : _bookingdto.CreateAppointmentDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], BookingController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], BookingController.prototype, "get", null);
_ts_decorate([
    (0, _common.Post)(':id/confirm'),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], BookingController.prototype, "confirm", null);
_ts_decorate([
    (0, _common.Post)(':id/cancel'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], BookingController.prototype, "cancel", null);
BookingController = _ts_decorate([
    (0, _swagger.ApiTags)('booking'),
    (0, _common.Controller)('appointments'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _bookingservice.BookingService === "undefined" ? Object : _bookingservice.BookingService
    ])
], BookingController);

//# sourceMappingURL=booking.controller.js.map