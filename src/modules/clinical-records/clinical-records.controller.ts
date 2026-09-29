import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ClinicalRecordsService, type CarePlan, type ClinicalNote, type Encounter } from './clinical-records.service';
import {
  AmendClinicalNoteDto,
  CreateCarePlanDto,
  CreateClinicalNoteDto,
  CreateDiagnosticOrderDto,
  CreateDiagnosticResultDto,
  CreateEncounterDto,
  CreatePrescriptionDto,
  CreateReferralDto,
  ReviewDiagnosticResultDto,
  SignClinicalNoteDto,
} from './dto/clinical-records.dto';

@ApiTags('clinical-records')
@Controller()
export class ClinicalRecordsController {
  constructor(private readonly records: ClinicalRecordsService) {}

  @Post('encounters')
  createEncounter(@Body() body: CreateEncounterDto): Promise<Encounter> {
    return this.records.createEncounter(body);
  }

  @Get('encounters/:id')
  getEncounter(@Param('id', ParseUUIDPipe) id: string): Promise<Encounter> {
    return this.records.getEncounter(id);
  }

  @Post('encounters/:id/notes')
  addNote(@Param('id', ParseUUIDPipe) encounterId: string, @Body() body: CreateClinicalNoteDto): Promise<ClinicalNote> {
    return this.records.addNote(encounterId, body.authorProviderId, body.body);
  }

  @Post('notes/:id/sign')
  signNote(@Param('id', ParseUUIDPipe) id: string, @Body() body: SignClinicalNoteDto): Promise<ClinicalNote> {
    return this.records.signNote(id, body.authorProviderId);
  }

  @Post('notes/:id/amend')
  amendNote(@Param('id', ParseUUIDPipe) id: string, @Body() body: AmendClinicalNoteDto): Promise<ClinicalNote> {
    return this.records.amendNote(id, body.authorProviderId, body.body);
  }

  /** View 20 — Care Plan & Visit Summary. */
  @Post('encounters/:id/care-plans')
  addCarePlan(@Param('id', ParseUUIDPipe) encounterId: string, @Body() body: CreateCarePlanDto): Promise<CarePlan> {
    return this.records.addCarePlan(encounterId, body);
  }

  @Post('encounters/:id/prescriptions')
  addPrescription(@Param('id', ParseUUIDPipe) encounterId: string, @Body() body: CreatePrescriptionDto) {
    return this.records.addPrescription(encounterId, body);
  }

  @Post('encounters/:id/referrals')
  addReferral(@Param('id', ParseUUIDPipe) encounterId: string, @Body() body: CreateReferralDto) {
    return this.records.addReferral(encounterId, body);
  }

  @Post('encounters/:id/diagnostic-orders')
  addDiagnosticOrder(@Param('id', ParseUUIDPipe) encounterId: string, @Body() body: CreateDiagnosticOrderDto) {
    return this.records.addDiagnosticOrder(encounterId, body);
  }

  @Post('diagnostic-orders/:id/results')
  addDiagnosticResult(@Param('id', ParseUUIDPipe) orderId: string, @Body() body: CreateDiagnosticResultDto) {
    return this.records.addDiagnosticResult(orderId, body);
  }

  /** View 21 — Health Records (a diagnostic result's clinician-review status). */
  @Post('diagnostic-results/:id/review')
  reviewDiagnosticResult(@Param('id', ParseUUIDPipe) id: string, @Body() body: ReviewDiagnosticResultDto) {
    return this.records.reviewDiagnosticResult(id, body.reviewedByProviderId);
  }
}
