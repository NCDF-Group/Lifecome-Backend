import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { CareService } from './care.service';
import {
  CancelCareVisitDto,
  CareAssessmentRequestDto,
  CareUrgentReportDto,
  ChangeCareVisitDto,
  RequestChangeCareArrangementDto,
} from './dto/care.dto';

@ApiTags('care')
@Controller('care')
export class CareController {
  constructor(private readonly careService: CareService) {}

  /** Professional care overview (C01). */
  @Get('overview')
  getPublicOverview() {
    return this.careService.getOverview('');
  }

  /** Professional care overview with user-specific counts when authenticated. */
  @UseGuards(PatientAuthGuard)
  @Get('overview/me')
  getMyOverview(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.careService.getOverview(account.sub);
  }

  /** Actual care services catalogue. */
  @Get('services')
  getServicesCatalogue() {
    return this.careService.getServicesCatalogue();
  }

  // --- Assessment Requests (C02 & C03) ---

  @UseGuards(PatientAuthGuard)
  @Post('assessment-requests')
  createAssessmentRequest(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CareAssessmentRequestDto,
  ) {
    return this.careService.createAssessmentRequest(account.sub, body);
  }

  @UseGuards(PatientAuthGuard)
  @Get('assessment-requests')
  listAssessmentRequests(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.careService.listAssessmentRequests(account.sub);
  }

  @UseGuards(PatientAuthGuard)
  @Get('assessment-requests/:id')
  getAssessmentRequest(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.careService.getAssessmentRequest(account.sub, id);
  }

  @UseGuards(PatientAuthGuard)
  @Post('assessment-requests/:id/cancel')
  cancelAssessmentRequest(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.careService.cancelAssessmentRequest(account.sub, id);
  }

  // --- My Care Arrangements (C04) ---

  @UseGuards(PatientAuthGuard)
  @Get('arrangements')
  listArrangements(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.careService.listArrangements(account.sub);
  }

  @UseGuards(PatientAuthGuard)
  @Get('arrangements/:id')
  getArrangement(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.careService.getArrangement(account.sub, id);
  }

  @UseGuards(PatientAuthGuard)
  @Post('arrangements/:id/request-change')
  requestChangeArrangement(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RequestChangeCareArrangementDto,
  ) {
    return this.careService.requestChangeArrangement(account.sub, id, body);
  }

  // --- Scheduled Care Visits ---

  @UseGuards(PatientAuthGuard)
  @Get('visits')
  listVisits(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.careService.listVisits(account.sub);
  }

  @UseGuards(PatientAuthGuard)
  @Post('visits/:id/cancel')
  cancelVisit(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelCareVisitDto,
  ) {
    return this.careService.cancelVisit(account.sub, id, body);
  }

  @UseGuards(PatientAuthGuard)
  @Post('visits/:id/change-request')
  changeVisit(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeCareVisitDto,
  ) {
    return this.careService.changeVisit(account.sub, id, body);
  }

  @UseGuards(PatientAuthGuard)
  @Post('urgent-report')
  reportUrgentIssue(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CareUrgentReportDto,
  ) {
    return this.careService.reportUrgentIssue(account.sub, body);
  }
}
