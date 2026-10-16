import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { BookTreatmentReviewDto, MenopauseAssessmentDto } from './dto/gp.dto';
import { GpService } from './gp.service';

@ApiTags('gp')
@Controller('gp')
export class GpController {
  constructor(private readonly gpService: GpService) {}

  /** GP Service Hub summary (G01). */
  @Get('hub')
  getHub() {
    return this.gpService.getHub();
  }

  /** Operating clinics for physical clinic appointments. */
  @Get('clinics')
  listClinics() {
    return this.gpService.listClinics();
  }

  @Get('clinics/:id')
  getClinicById(@Param('id', ParseUUIDPipe) id: string) {
    return this.gpService.getClinicById(id);
  }

  /** Menopause Care overview and copy. */
  @Get('menopause/overview')
  getMenopauseOverview() {
    return this.gpService.getMenopauseOverview();
  }

  /** Submit initial menopause assessment questionnaire. */
  @UseGuards(PatientAuthGuard)
  @Post('menopause/assessments')
  submitMenopauseAssessment(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: MenopauseAssessmentDto,
  ) {
    return this.gpService.submitMenopauseAssessment(account.sub, body);
  }

  /** List user's menopause assessments. */
  @UseGuards(PatientAuthGuard)
  @Get('menopause/assessments')
  listMenopauseAssessments(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.gpService.listMenopauseAssessments(account.sub);
  }

  /** Get specific menopause assessment. */
  @UseGuards(PatientAuthGuard)
  @Get('menopause/assessments/:id')
  getMenopauseAssessment(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.gpService.getMenopauseAssessment(account.sub, id);
  }

  /** Book a treatment review route for existing patients. */
  @UseGuards(PatientAuthGuard)
  @Post('menopause/reviews')
  bookTreatmentReview(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: BookTreatmentReviewDto,
  ) {
    return this.gpService.bookTreatmentReview(account.sub, body);
  }
}
