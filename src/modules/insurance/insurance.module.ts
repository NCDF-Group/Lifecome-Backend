import { Module } from '@nestjs/common';
import { PatientModule } from '../patient/patient.module';
import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';

@Module({
  imports: [PatientModule],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService],
})
export class InsuranceModule {}
