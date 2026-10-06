import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { PatientService } from '../patient/patient.service';
import { VerifyMembershipDto } from './dto/payer.dto';
import { PayerService, type Membership, type Payer } from './payer.service';

@ApiTags('payer')
@UseGuards(PatientAuthGuard)
@Controller('payers')
export class PayerController {
  constructor(
    private readonly payerService: PayerService,
    private readonly patients: PatientService,
  ) {}

  /** View 06 — Select Your HMO. LifeCome HMO may be listed first via `displayOrder`, never hard-coded. */
  @Get()
  list(): Promise<Payer[]> {
    return this.payerService.listParticipatingPayers();
  }

  /** View 07 — Verify HMO Membership. */
  @Post('verify-membership')
  @Idempotent()
  async verifyMembership(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: VerifyMembershipDto): Promise<Membership> {
    // The patient comes from the session, never the body - nobody can verify a membership for someone else.
    const patient = await this.patients.requireProfile(account.sub);
    return this.payerService.verifyMembership(patient.id, body.payerCode, body.memberId);
  }
}
