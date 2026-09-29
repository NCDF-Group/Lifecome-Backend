import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const PaymentStatusSchema = z.enum([
  'initiated',
  'pending',
  'successful',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
]);

export const ListPaymentsQuerySchema = PaginationQuerySchema.extend({
  status: PaymentStatusSchema.optional(),
});
export class ListPaymentsQueryDto extends createZodDto(ListPaymentsQuerySchema) {}

export const CreatePaymentIntentSchema = z.object({
  appointmentId: z.uuid(),
  clinicalServiceId: z.uuid(),
  gateway: z.enum(['paystack', 'flutterwave']).default('paystack'),
  idempotencyKey: z.string().min(8),
});
export class CreatePaymentIntentDto extends createZodDto(CreatePaymentIntentSchema) {}

/** Simplified shape of the fields every gateway webhook needs, mapped from the real payload upstream. */
export const PaymentWebhookSchema = z.object({
  gatewayReference: z.string().min(1),
  status: z.enum(['successful', 'failed']),
});
export class PaymentWebhookDto extends createZodDto(PaymentWebhookSchema) {}
