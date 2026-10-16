import { Module } from '@nestjs/common';
import { PatientModule } from '../patient/patient.module';
import { CareController } from './care.controller';
import { CareService } from './care.service';

@Module({
  imports: [PatientModule],
  controllers: [CareController],
  providers: [CareService],
  exports: [CareService],
})
export class CareModule {}
