import { Module } from '@nestjs/common';

import { PatientModule } from '../patient/patient.module';
import { ConsentAdminController } from './consent-admin.controller';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';

@Module({
  imports: [PatientModule],
  controllers: [ConsentController, ConsentAdminController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
