import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { PatientService } from '../patient/patient.service';
import { ClinicalRecordsService } from './clinical-records.service';

/**
 * The signed-in patient's own longitudinal clinical records (encounters, care plans,
 * prescriptions, referrals, and diagnostic results). Scoped strictly to the session's patient.
 */
@ApiTags('clinical-records')
@UseGuards(PatientAuthGuard)
@Controller('me')
export class PatientRecordsController {
  constructor(
    private readonly records: ClinicalRecordsService,
    private readonly patients: PatientService,
  ) {}

  /** View 21 — Consolidated longitudinal health records overview. */
  @Get('records')
  async getMyRecords(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.getConsolidatedRecordsForPatient(patient.id);
  }

  @Get('encounters')
  async listMyEncounters(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.listEncountersForPatient(patient.id);
  }

  /** View 20 — Care Plan & Visit Summary for a past encounter. */
  @Get('encounters/:id')
  async getMyEncounter(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.getEncounterDetailForPatient(patient.id, id);
  }

  @Get('care-plans')
  async listMyCarePlans(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.listCarePlansForPatient(patient.id);
  }

  @Get('prescriptions')
  async listMyPrescriptions(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.listPrescriptionsForPatient(patient.id);
  }

  @Get('referrals')
  async listMyReferrals(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.listReferralsForPatient(patient.id);
  }

  @Get('diagnostic-results')
  async listMyDiagnosticResults(@CurrentPatientAccount() account: PatientAccountToken) {
    const patient = await this.patients.requireProfile(account.sub);
    return this.records.listDiagnosticResultsForPatient(patient.id);
  }
}
