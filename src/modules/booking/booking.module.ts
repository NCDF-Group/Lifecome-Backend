import { Module } from '@nestjs/common';

import { PatientModule } from '../patient/patient.module';
import { PatientNotificationsModule } from '../patient-notifications/patient-notifications.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { BookingAdminController } from './booking-admin.controller';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [SchedulingModule, PatientModule, PatientNotificationsModule],
  controllers: [BookingController, BookingAdminController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
