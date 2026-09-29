import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { ListPaymentsQueryDto } from './dto/payment.dto';
import { PaymentService, type PaymentTransaction } from './payment.service';

/** `/admin/payments` — the "Payments" page in the operations console. */
@ApiTags('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/payments')
export class PaymentAdminController {
  constructor(private readonly payments: PaymentService) {}

  @Get()
  list(@Query() query: ListPaymentsQueryDto) {
    return this.payments.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentTransaction> {
    return this.payments.getById(id);
  }
}
