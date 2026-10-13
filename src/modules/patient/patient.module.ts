import { Module } from '@nestjs/common';

import { PatientAdminController } from './patient-admin.controller';
import { PatientController } from './patient.controller';
import { PatientMeController } from './patient-me.controller';
import { PatientService } from './patient.service';

@Module({
  controllers: [PatientMeController, PatientController, PatientAdminController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
