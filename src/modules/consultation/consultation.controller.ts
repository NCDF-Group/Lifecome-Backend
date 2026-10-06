import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { BookingService } from '../booking/booking.service';
import { ConsultationService, type ConsultationSession } from './consultation.service';
import { TransitionConsultationDto } from './dto/consultation.dto';

/** States the patient's own device may move the session into; joining/connecting belongs to the clinician. */
const PATIENT_STATES = ['check_in_open', 'device_check', 'waiting', 'reconnecting', 'audio_fallback', 'ended'];

@ApiTags('consultation')
@UseGuards(PatientAuthGuard)
@Controller('appointments/:appointmentId/consultation')
export class ConsultationController {
  constructor(
    private readonly consultations: ConsultationService,
    private readonly booking: BookingService,
  ) {}

  /** View 18 — Consultation Waiting Room. */
  @Get()
  async get(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
  ): Promise<ConsultationSession> {
    await this.booking.getForPatient(account.sub, appointmentId);
    return this.consultations.getOrCreateForAppointment(appointmentId);
  }

  /** View 19 — Video / Audio Consultation (and every waiting-room state in between). */
  @Post('transition')
  async transition(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() body: TransitionConsultationDto,
  ): Promise<ConsultationSession> {
    await this.booking.getForPatient(account.sub, appointmentId);
    if (!PATIENT_STATES.includes(body.status)) {
      throw new ForbiddenException('Only your clinician can move the consultation into that state.');
    }
    return this.consultations.transition(appointmentId, body.status);
  }
}
