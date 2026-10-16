import { Module } from '@nestjs/common';
import { PatientModule } from '../patient/patient.module';
import { WellbeingController } from './wellbeing.controller';
import { WellbeingService } from './wellbeing.service';

@Module({
  imports: [PatientModule],
  controllers: [WellbeingController],
  providers: [WellbeingService],
  exports: [WellbeingService],
})
export class WellbeingModule {}
