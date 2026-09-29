import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, getTableColumns, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { appointments, clinicalServices, patients, paymentTransactions } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { AuditService } from '../audit/audit.service';
import { BookingService } from '../booking/booking.service';
import type { CreatePaymentIntentDto, ListPaymentsQueryDto } from './dto/payment.dto';

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

/** A payment row joined with the names `/admin/payments` shows instead of raw foreign keys. */
export type AdminPaymentRow = PaymentTransaction & {
  patientName: string;
  serviceName: string;
};

/**
 * Payment intents, gateway abstraction and idempotent confirmation (blueprint §13). The amount is
 * always looked up from `clinical_services` server-side — the client never sends, and this
 * service never trusts, an amount.
 *
 * No real gateway is wired in yet (see .env.example — PAYSTACK_SECRET_KEY / FLUTTERWAVE_SECRET_KEY).
 * `gatewayReference` is a simulated reference until one is; `handleWebhook` is written against the
 * shape every gateway's webhook reduces to, so swapping in a real one only touches
 * `createIntent`'s gateway call and the webhook signature check.
 */
@Injectable()
export class PaymentService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly booking: BookingService,
    private readonly audit: AuditService,
  ) {}

  async createIntent(input: CreatePaymentIntentDto): Promise<PaymentTransaction> {
    const [service] = await this.db.select().from(clinicalServices).where(eq(clinicalServices.id, input.clinicalServiceId));
    if (!service) throw new NotFoundAppException('Clinical service');

    const gatewayReference = `sim_${randomUUID()}`;

    const [transaction] = await this.db
      .insert(paymentTransactions)
      .values({
        appointmentId: input.appointmentId,
        amountKobo: service.basePriceKobo,
        gateway: input.gateway,
        gatewayReference,
        idempotencyKey: input.idempotencyKey,
        status: 'pending',
      })
      .returning();

    return transaction;
  }

  async getById(id: string): Promise<PaymentTransaction> {
    const [transaction] = await this.db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    if (!transaction) throw new NotFoundAppException('Payment transaction');
    return transaction;
  }

  /** `/admin/payments` — the "Payments" page in the operations console. */
  async adminList(query: ListPaymentsQueryDto): Promise<PaginatedResult<AdminPaymentRow>> {
    const where = query.status ? eq(paymentTransactions.status, query.status) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(paymentTransactions).where(where);
    const items = await this.db
      .select({
        ...getTableColumns(paymentTransactions),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        serviceName: clinicalServices.name,
      })
      .from(paymentTransactions)
      .innerJoin(appointments, eq(paymentTransactions.appointmentId, appointments.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .where(where)
      .orderBy(desc(paymentTransactions.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  async getByGatewayReference(gatewayReference: string): Promise<PaymentTransaction> {
    const [transaction] = await this.db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.gatewayReference, gatewayReference));
    if (!transaction) throw new NotFoundAppException('Payment transaction');
    return transaction;
  }

  /**
   * Only a verified webhook (or, in a real integration, a server-side verify call against the
   * gateway) may mark a payment successful — the booking is never confirmed from a client-supplied
   * "I paid" flag.
   */
  async handleWebhook(gatewayReference: string, status: 'successful' | 'failed'): Promise<PaymentTransaction> {
    const transaction = await this.getByGatewayReference(gatewayReference);
    if (transaction.status === 'successful' || transaction.status === 'failed') {
      return transaction; // already processed — webhooks can and do arrive more than once
    }

    const receiptNumber = status === 'successful' ? `RCPT-${Date.now()}` : null;

    const [updated] = await this.db
      .update(paymentTransactions)
      .set({ status, receiptNumber, updatedAt: new Date() })
      .where(eq(paymentTransactions.id, transaction.id))
      .returning();

    await this.audit.record({
      actorType: 'system',
      actorId: 'payment-webhook',
      action: 'payment_state_change',
      resourceType: 'payment_transaction',
      resourceId: transaction.id,
      metadata: { status },
    });

    if (status === 'successful') {
      await this.booking.confirm(transaction.appointmentId);
    }

    return updated;
  }

  async refund(id: string, partial = false): Promise<PaymentTransaction> {
    const [transaction] = await this.db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    if (!transaction) throw new NotFoundAppException('Payment transaction');
    if (transaction.status !== 'successful') {
      throw new AppException('PAYMENT_NOT_REFUNDABLE', 'Only a successful payment can be refunded.', 409);
    }

    const [updated] = await this.db
      .update(paymentTransactions)
      .set({ status: partial ? 'partially_refunded' : 'refunded', updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();

    return updated;
  }
}
