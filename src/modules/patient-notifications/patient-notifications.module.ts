import { Module } from '@nestjs/common';

import { PatientModule } from '../patient/patient.module';
import { PatientNotificationsController } from './patient-notifications.controller';
import { PatientNotificationsService } from './patient-notifications.service';

@Module({
  imports: [PatientModule],
  controllers: [PatientNotificationsController],
  providers: [PatientNotificationsService],
  exports: [PatientNotificationsService],
})
export class PatientNotificationsModule {}
