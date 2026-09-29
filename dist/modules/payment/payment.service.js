"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentService", {
    enumerable: true,
    get: function() {
        return PaymentService;
    }
});
const _nodecrypto = require("node:crypto");
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
const _auditservice = require("../audit/audit.service");
const _bookingservice = require("../booking/booking.service");
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
let PaymentService = class PaymentService {
    async createIntent(input) {
        const [service] = await this.db.select().from(_schema.clinicalServices).where((0, _drizzleorm.eq)(_schema.clinicalServices.id, input.clinicalServiceId));
        if (!service) throw new _appexception.NotFoundAppException('Clinical service');
        const gatewayReference = `sim_${(0, _nodecrypto.randomUUID)()}`;
        const [transaction] = await this.db.insert(_schema.paymentTransactions).values({
            appointmentId: input.appointmentId,
            amountKobo: service.basePriceKobo,
            gateway: input.gateway,
            gatewayReference,
            idempotencyKey: input.idempotencyKey,
            status: 'pending'
        }).returning();
        return transaction;
    }
    async getById(id) {
        const [transaction] = await this.db.select().from(_schema.paymentTransactions).where((0, _drizzleorm.eq)(_schema.paymentTransactions.id, id));
        if (!transaction) throw new _appexception.NotFoundAppException('Payment transaction');
        return transaction;
    }
    /** `/admin/payments` — the "Payments" page in the operations console. */ async adminList(query) {
        const where = query.status ? (0, _drizzleorm.eq)(_schema.paymentTransactions.status, query.status) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.paymentTransactions).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.paymentTransactions),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`,
            serviceName: _schema.clinicalServices.name
        }).from(_schema.paymentTransactions).innerJoin(_schema.appointments, (0, _drizzleorm.eq)(_schema.paymentTransactions.appointmentId, _schema.appointments.id)).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.appointments.patientId, _schema.patients.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.paymentTransactions.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    async getByGatewayReference(gatewayReference) {
        const [transaction] = await this.db.select().from(_schema.paymentTransactions).where((0, _drizzleorm.eq)(_schema.paymentTransactions.gatewayReference, gatewayReference));
        if (!transaction) throw new _appexception.NotFoundAppException('Payment transaction');
        return transaction;
    }
    /**
   * Only a verified webhook (or, in a real integration, a server-side verify call against the
   * gateway) may mark a payment successful — the booking is never confirmed from a client-supplied
   * "I paid" flag.
   */ async handleWebhook(gatewayReference, status) {
        const transaction = await this.getByGatewayReference(gatewayReference);
        if (transaction.status === 'successful' || transaction.status === 'failed') {
            return transaction; // already processed — webhooks can and do arrive more than once
        }
        const receiptNumber = status === 'successful' ? `RCPT-${Date.now()}` : null;
        const [updated] = await this.db.update(_schema.paymentTransactions).set({
            status,
            receiptNumber,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.paymentTransactions.id, transaction.id)).returning();
        await this.audit.record({
            actorType: 'system',
            actorId: 'payment-webhook',
            action: 'payment_state_change',
            resourceType: 'payment_transaction',
            resourceId: transaction.id,
            metadata: {
                status
            }
        });
        if (status === 'successful') {
            await this.booking.confirm(transaction.appointmentId);
        }
        return updated;
    }
    async refund(id, partial = false) {
        const [transaction] = await this.db.select().from(_schema.paymentTransactions).where((0, _drizzleorm.eq)(_schema.paymentTransactions.id, id));
        if (!transaction) throw new _appexception.NotFoundAppException('Payment transaction');
        if (transaction.status !== 'successful') {
            throw new _appexception.AppException('PAYMENT_NOT_REFUNDABLE', 'Only a successful payment can be refunded.', 409);
        }
        const [updated] = await this.db.update(_schema.paymentTransactions).set({
            status: partial ? 'partially_refunded' : 'refunded',
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.paymentTransactions.id, id)).returning();
        return updated;
    }
    constructor(db, booking, audit){
        this.db = db;
        this.booking = booking;
        this.audit = audit;
    }
};
PaymentService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _bookingservice.BookingService === "undefined" ? Object : _bookingservice.BookingService,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], PaymentService);

//# sourceMappingURL=payment.service.js.map