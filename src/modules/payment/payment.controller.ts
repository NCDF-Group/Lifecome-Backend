import { timingSafeEqual } from 'node:crypto';

import { Body, Controller, ForbiddenException, Headers, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  CurrentPatientAccount,
  JwtAuthGuard,
  PatientAuthGuard,
  Roles,
  RolesGuard,
  type PatientAccountToken,
} from '../../common/auth/common-auth.module';
import { AppConfigService } from '../../common/config/configuration';
import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { BookingService } from '../booking/booking.service';
import { CreatePaymentIntentDto, PaymentWebhookDto } from './dto/payment.dto';
import { PaymentService, type PaymentTransaction } from './payment.service';

@ApiTags('payment')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly payments: PaymentService,
    private readonly booking: BookingService,
    private readonly config: AppConfigService,
  ) {}

  /** View 16 — Payment / HMO Authorisation (direct-pay branch). */
  @UseGuards(PatientAuthGuard)
  @Post('intents')
  @Idempotent()
  async createIntent(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CreatePaymentIntentDto,
  ): Promise<PaymentTransaction> {
    // Only for the patient's own appointment, and priced from that appointment's service - never from
    // a service id the client picked.
    const appointment = await this.booking.getForPatient(account.sub, body.appointmentId);
    return this.payments.createIntent({ ...body, clinicalServiceId: appointment.clinicalServiceId });
  }

  /**
   * Gateway webhook. Fails closed: without `PAYMENT_WEBHOOK_SECRET` configured it refuses everything, and
   * otherwise it needs that secret in `x-webhook-secret`. Replace with the gateway's real signature check
   * (e.g. Paystack's HMAC of the raw body) when a gateway is wired in.
   */
  @Post('webhook')
  webhook(@Headers('x-webhook-secret') secret: string | undefined, @Body() body: PaymentWebhookDto): Promise<PaymentTransaction> {
    const expected = this.config.paymentWebhookSecret;
    const given = Buffer.from(secret ?? '');
    const wanted = Buffer.from(expected ?? '');
    if (!expected || given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
      throw new ForbiddenException('Webhook not accepted.');
    }
    return this.payments.handleWebhook(body.gatewayReference, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_administrator', 'hmo_operations')
  @Post(':id/refund')
  refund(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentTransaction> {
    return this.payments.refund(id);
  }
}
