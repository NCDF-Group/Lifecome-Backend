import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { VerifyMembershipDto } from './dto/payer.dto';
import { PayerService, type Membership, type Payer } from './payer.service';

@ApiTags('payer')
@Controller('payers')
export class PayerController {
  constructor(private readonly payerService: PayerService) {}

  /** View 06 — Select Your HMO. LifeCome HMO may be listed first via `displayOrder`, never hard-coded. */
  @Get()
  list(): Promise<Payer[]> {
    return this.payerService.listParticipatingPayers();
  }

  /** View 07 — Verify HMO Membership. */
  @Post('verify-membership')
  @Idempotent()
  verifyMembership(@Body() body: VerifyMembershipDto): Promise<Membership> {
    return this.payerService.verifyMembership(body.patientId, body.payerCode, body.memberId);
  }
}
