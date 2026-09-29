import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { BookingService, type Appointment } from './booking.service';
import { ListAppointmentsQueryDto } from './dto/booking.dto';

/** `/admin/bookings` — the "Bookings" page in the operations console. */
@ApiTags('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/bookings')
export class BookingAdminController {
  constructor(private readonly booking: BookingService) {}

  @Get()
  list(@Query() query: ListAppointmentsQueryDto) {
    return this.booking.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Appointment> {
    return this.booking.getById(id);
  }
}
