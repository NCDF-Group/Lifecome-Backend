import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { PatientService } from '../patient/patient.service';
import { VerifyMembershipDto } from './dto/payer.dto';
import { PayerService, type CoveragePlan, type Membership, type PatientMembershipRow, type Payer } from './payer.service';

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

  /** The signed-in patient's verified HMO memberships. */
  @Get('memberships')
  async listMyMemberships(@CurrentPatientAccount() account: PatientAccountToken): Promise<PatientMembershipRow[]> {
    const patient = await this.patients.requireProfile(account.sub);
    return this.payerService.listMembershipsForPatient(patient.id);
  }

  /** Remove/unlink an HMO membership. */
  @Delete('memberships/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyMembership(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    const patient = await this.patients.requireProfile(account.sub);
    return this.payerService.deleteMembership(patient.id, id);
  }

  /** View 08 — HMO Coverage & Benefits for a payer. */
  @Get(':code/coverage-plans')
  getCoveragePlans(@Param('code') code: string): Promise<CoveragePlan[]> {
    return this.payerService.getCoveragePlans(code);
  }
}
