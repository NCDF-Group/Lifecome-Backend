import { Module } from '@nestjs/common';
import { PatientModule } from '../patient/patient.module';
import { GpController } from './gp.controller';
import { GpService } from './gp.service';

@Module({
  imports: [PatientModule],
  controllers: [GpController],
  providers: [GpService],
  exports: [GpService],
})
export class GpModule {}
