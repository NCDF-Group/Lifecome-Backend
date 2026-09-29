import { Module } from '@nestjs/common';

import { PatientAdminController } from './patient-admin.controller';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

@Module({
  controllers: [PatientController, PatientAdminController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
