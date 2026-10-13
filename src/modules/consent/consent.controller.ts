import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { PatientService } from '../patient/patient.service';
import { ConsentService, type ConsentRecord } from './consent.service';
import { GrantConsentDto, GrantMyConsentDto } from './dto/consent.dto';

@ApiTags('consent')
@Controller('consent')
export class ConsentController {
  constructor(
    private readonly consent: ConsentService,
    private readonly patients: PatientService,
  ) {}

  @Post()
  grant(@Body() body: GrantConsentDto): Promise<ConsentRecord> {
    return this.consent.grant(body);
  }

  @Post(':id/revoke')
  revoke(@Param('id', ParseUUIDPipe) id: string): Promise<ConsentRecord> {
    return this.consent.revoke(id);
  }

  @Get('patients/:patientId')
  list(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<ConsentRecord[]> {
    return this.consent.list(patientId);
  }

  // ---- Patient Self-Service ----------------------------------------------------------------

  @UseGuards(PatientAuthGuard)
  @Get('me')
  async listMyConsents(@CurrentPatientAccount() account: PatientAccountToken): Promise<ConsentRecord[]> {
    const patient = await this.patients.requireProfile(account.sub);
    return this.consent.list(patient.id);
  }

  @UseGuards(PatientAuthGuard)
  @Post('me')
  async grantMyConsent(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: GrantMyConsentDto,
  ): Promise<ConsentRecord> {
    const patient = await this.patients.requireProfile(account.sub);
    return this.consent.grant({ ...body, patientId: patient.id });
  }

  @UseGuards(PatientAuthGuard)
  @Post('me/:id/revoke')
  async revokeMyConsent(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConsentRecord> {
    await this.patients.requireProfile(account.sub);
    return this.consent.revoke(id);
  }
}
