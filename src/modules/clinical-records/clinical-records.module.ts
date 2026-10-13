import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PatientModule } from '../patient/patient.module';
import { ClinicalRecordsController } from './clinical-records.controller';
import { ClinicalRecordsService } from './clinical-records.service';
import { PatientRecordsController } from './patient-records.controller';

@Module({
  imports: [AuditModule, PatientModule],
  controllers: [ClinicalRecordsController, PatientRecordsController],
  providers: [ClinicalRecordsService],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}
