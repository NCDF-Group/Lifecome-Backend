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
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _idempotentdecorator = require("../../common/interceptors/idempotent.decorator");
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
    constructor(payments){
        this.payments = payments;
    }
    /** View 16 — Payment / HMO Authorisation (direct-pay branch). */ createIntent(body) {
        return this.payments.createIntent(body);
    }
    /**
   * Gateway webhook. In production this must verify the request signature before trusting it —
   * left as a clear extension point next to the gateway credentials in .env.example.
   */ webhook(body) {
        return this.payments.handleWebhook(body.gatewayReference, body.status);
    }
    refund(id) {
        return this.payments.refund(id);
    }
};
_ts_decorate([
    (0, _common.Post)('intents'),
    (0, _idempotentdecorator.Idempotent)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentdto.CreatePaymentIntentDto === "undefined" ? Object : _paymentdto.CreatePaymentIntentDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PaymentController.prototype, "createIntent", null);
_ts_decorate([
    (0, _common.Post)('webhook'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentdto.PaymentWebhookDto === "undefined" ? Object : _paymentdto.PaymentWebhookDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], PaymentController.prototype, "webhook", null);
_ts_decorate([
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
        typeof _paymentservice.PaymentService === "undefined" ? Object : _paymentservice.PaymentService
    ])
], PaymentController);

//# sourceMappingURL=payment.controller.js.map