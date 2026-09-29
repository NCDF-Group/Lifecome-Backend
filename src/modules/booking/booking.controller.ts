import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { BookingService, type Appointment } from './booking.service';
import { CreateAppointmentDto } from './dto/booking.dto';

@ApiTags('booking')
@Controller('appointments')
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Post()
  @Idempotent()
  create(@Body() body: CreateAppointmentDto): Promise<Appointment> {
    return this.booking.create(body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.getById(id);
  }

  @Post(':id/confirm')
  @Idempotent()
  confirm(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.confirm(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.cancel(id);
  }
}
