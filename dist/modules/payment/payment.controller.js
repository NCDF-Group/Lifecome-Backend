"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentController", {
    enumerable: true,
    get: function() {
        return PaymentController;
    }
});
const _nodecrypto = require("node:crypto");
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _configuration = require("../../common/config/configuration");
const _idempotentdecorator = require("../../common/interceptors/idempotent.decorator");
const _bookingservice = require("../booking/booking.service");
const _paymentdto = require("./dto/payment.dto");
const _paymentservice = require("./payment.service");
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
let PaymentController = class PaymentController {
    /** View 16 — Payment / HMO Authorisation (direct-pay branch). */ async createIntent(account, body) {
        // Only for the patient's own appointment, and priced from that appointment's service - never from
        // a service id the client picked.
        const appointment = await this.booking.getForPatient(account.sub, body.appointmentId);
        return this.payments.createIntent({
            ...body,
            clinicalServiceId: appointment.clinicalServiceId
        });
    }
    /**
   * Gateway webhook. Fails closed: without `PAYMENT_WEBHOOK_SECRET` configured it refuses everything, and
   * otherwise it needs that secret in `x-webhook-secret`. Replace with the gateway's real signature check
   * (e.g. Paystack's HMAC of the raw body) when a gateway is wired in.
   */ webhook(secret, body) {
        const expected = this.config.paymentWebhookSecret;
        const given = Buffer.from(secret ?? '');
        const wanted = Buffer.from(expected ?? '');
        if (!expected || given.length !== wanted.length || !(0, _nodecrypto.timingSafeEqual)(given, wanted)) {
            throw new _common.ForbiddenException('Webhook not accepted.');
        }
        return this.payments.handleWebhook(body.gatewayReference, body.status);
    }
    refund(id) {
        return this.payments.refund(id);
    }
    constructor(payments, booking, config){
        this.payments = payments;
        this.booking = booking;
        this.config = config;
    }
};
_ts_decorate([
    (0, _common.UseGuards)(_commonauthmodule.PatientAuthGuard),
    (0, _common.Post)('intents'),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _commonauthmodule.CurrentPatientAccount)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof PatientAccountToken === "undefined" ? Object : PatientAccountToken,
        typeof _paymentdto.CreatePaymentIntentDto === "undefined" ? Object : _paymentdto.CreatePaymentIntentDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentController.prototype, "createIntent", null);
_ts_decorate([
    (0, _common.Post)('webhook'),
    _ts_param(0, (0, _common.Headers)('x-webhook-secret')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _paymentdto.PaymentWebhookDto === "undefined" ? Object : _paymentdto.PaymentWebhookDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PaymentController.prototype, "webhook", null);
_ts_decorate([
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _commonauthmodule.Roles)('platform_administrator', 'hmo_operations'),
    (0, _common.Post)(':id/refund'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PaymentController.prototype, "refund", null);
PaymentController = _ts_decorate([
    (0, _swagger.ApiTags)('payment'),
    (0, _common.Controller)('payments'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentservice.PaymentService === "undefined" ? Object : _paymentservice.PaymentService,
        typeof _bookingservice.BookingService === "undefined" ? Object : _bookingservice.BookingService,
        typeof _configuration.AppConfigService === "undefined" ? Object : _configuration.AppConfigService
    ])
], PaymentController);

//# sourceMappingURL=payment.controller.js.map