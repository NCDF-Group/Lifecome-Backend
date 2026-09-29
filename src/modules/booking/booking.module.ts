import { Module } from '@nestjs/common';

import { SchedulingModule } from '../scheduling/scheduling.module';
import { BookingAdminController } from './booking-admin.controller';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [SchedulingModule],
  controllers: [BookingController, BookingAdminController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
