import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { CreatePaymentIntentDto, PaymentWebhookDto } from './dto/payment.dto';
import { PaymentService, type PaymentTransaction } from './payment.service';

@ApiTags('payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  /** View 16 — Payment / HMO Authorisation (direct-pay branch). */
  @Post('intents')
  @Idempotent()
  createIntent(@Body() body: CreatePaymentIntentDto): Promise<PaymentTransaction> {
    return this.payments.createIntent(body);
  }

  /**
   * Gateway webhook. In production this must verify the request signature before trusting it —
   * left as a clear extension point next to the gateway credentials in .env.example.
   */
  @Post('webhook')
  webhook(@Body() body: PaymentWebhookDto): Promise<PaymentTransaction> {
    return this.payments.handleWebhook(body.gatewayReference, body.status);
  }

  @Post(':id/refund')
  refund(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentTransaction> {
    return this.payments.refund(id);
  }
}
