import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConsultationService, type ConsultationSession } from './consultation.service';
import { TransitionConsultationDto } from './dto/consultation.dto';

@ApiTags('consultation')
@Controller('appointments/:appointmentId/consultation')
export class ConsultationController {
  constructor(private readonly consultations: ConsultationService) {}

  /** View 18 — Consultation Waiting Room. */
  @Get()
  get(@Param('appointmentId', ParseUUIDPipe) appointmentId: string): Promise<ConsultationSession> {
    return this.consultations.getOrCreateForAppointment(appointmentId);
  }

  /** View 19 — Video / Audio Consultation (and every waiting-room state in between). */
  @Post('transition')
  transition(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() body: TransitionConsultationDto,
  ): Promise<ConsultationSession> {
    return this.consultations.transition(appointmentId, body.status);
  }
}
