"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "paymentTransactions", {
    enumerable: true,
    get: function() {
        return paymentTransactions;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const _bookingschema = require("./booking.schema");
const paymentTransactions = (0, _pgcore.pgTable)('payment_transactions', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    appointmentId: (0, _pgcore.uuid)('appointment_id').notNull().references(()=>_bookingschema.appointments.id, {
        onDelete: 'restrict'
    }),
    amountKobo: (0, _pgcore.integer)('amount_kobo').notNull(),
    currency: (0, _pgcore.text)('currency').notNull().default('NGN'),
    status: (0, _enums.paymentStatusEnum)('status').notNull().default('initiated'),
    gateway: (0, _pgcore.text)('gateway').notNull(),
    gatewayReference: (0, _pgcore.text)('gateway_reference'),
    receiptNumber: (0, _pgcore.text)('receipt_number').unique(),
    idempotencyKey: (0, _pgcore.text)('idempotency_key').notNull().unique(),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=payment.schema.js.map