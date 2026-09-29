"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get CreatePaymentIntentDto () {
        return CreatePaymentIntentDto;
    },
    get CreatePaymentIntentSchema () {
        return CreatePaymentIntentSchema;
    },
    get ListPaymentsQueryDto () {
        return ListPaymentsQueryDto;
    },
    get ListPaymentsQuerySchema () {
        return ListPaymentsQuerySchema;
    },
    get PaymentStatusSchema () {
        return PaymentStatusSchema;
    },
    get PaymentWebhookDto () {
        return PaymentWebhookDto;
    },
    get PaymentWebhookSchema () {
        return PaymentWebhookSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const PaymentStatusSchema = _zod.z.enum([
    'initiated',
    'pending',
    'successful',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
]);
const ListPaymentsQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    status: PaymentStatusSchema.optional()
});
let ListPaymentsQueryDto = class ListPaymentsQueryDto extends (0, _zoddto.createZodDto)(ListPaymentsQuerySchema) {
};
const CreatePaymentIntentSchema = _zod.z.object({
    appointmentId: _zod.z.uuid(),
    clinicalServiceId: _zod.z.uuid(),
    gateway: _zod.z.enum([
        'paystack',
        'flutterwave'
    ]).default('paystack'),
    idempotencyKey: _zod.z.string().min(8)
});
let CreatePaymentIntentDto = class CreatePaymentIntentDto extends (0, _zoddto.createZodDto)(CreatePaymentIntentSchema) {
};
const PaymentWebhookSchema = _zod.z.object({
    gatewayReference: _zod.z.string().min(1),
    status: _zod.z.enum([
        'successful',
        'failed'
    ])
});
let PaymentWebhookDto = class PaymentWebhookDto extends (0, _zoddto.createZodDto)(PaymentWebhookSchema) {
};

//# sourceMappingURL=payment.dto.js.map