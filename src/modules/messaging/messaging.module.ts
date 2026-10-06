import { Module } from '@nestjs/common';

import { PatientModule } from '../patient/patient.module';
import { PatientNotificationsModule } from '../patient-notifications/patient-notifications.module';
import { MessagingAdminController } from './messaging-admin.controller';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
  imports: [PatientModule, PatientNotificationsModule],
  controllers: [MessagingController, MessagingAdminController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
