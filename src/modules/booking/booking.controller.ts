import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { BookingService, type Appointment, type PatientAppointmentRow } from './booking.service';
import { CreateMyAppointmentDto } from './dto/booking.dto';

/**
 * The signed-in patient's own appointments. Every route is scoped to the patient in the session token;
 * an appointment that isn't theirs is reported as "not found", never as "forbidden".
 */
@ApiTags('booking')
@UseGuards(PatientAuthGuard)
@Controller('appointments')
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Post()
  @Idempotent()
  create(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: CreateMyAppointmentDto): Promise<Appointment> {
    return this.booking.createForPatient(account.sub, body);
  }

  @Get()
  list(@CurrentPatientAccount() account: PatientAccountToken): Promise<PatientAppointmentRow[]> {
    return this.booking.listForPatient(account.sub);
  }

  @Get(':id')
  get(@CurrentPatientAccount() account: PatientAccountToken, @Param('id', ParseUUIDPipe) id: string): Promise<PatientAppointmentRow> {
    return this.booking.getForPatient(account.sub, id);
  }

  @Post(':id/confirm')
  @Idempotent()
  confirm(@CurrentPatientAccount() account: PatientAccountToken, @Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.confirmForPatient(account.sub, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentPatientAccount() account: PatientAccountToken, @Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.cancelForPatient(account.sub, id);
  }
}
