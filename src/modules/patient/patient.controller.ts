import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { CreatePatientProfileDto, UpdatePatientProfileDto } from './dto/patient.dto';
import { PatientService, type Patient } from './patient.service';

/**
 * Direct `/patients` routes — used by client libraries and web/mobile apps that fetch or update
 * profiles by patient ID or account ID.
 */
@ApiTags('patient')
@UseGuards(PatientAuthGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patients: PatientService) {}

  @Post()
  create(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: CreatePatientProfileDto): Promise<Patient> {
    return this.patients.createProfile({ ...body, userAccountId: account.sub });
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<Patient> {
    return this.patients.getById(id);
  }

  @Patch(':id')
  async update(
    @CurrentPatientAccount() _account: PatientAccountToken,
    @Param('id') id: string,
    @Body() body: UpdatePatientProfileDto,
  ): Promise<Patient> {
    const profile = await this.patients.getById(id);
    return this.patients.update(profile.id, body);
  }
}
