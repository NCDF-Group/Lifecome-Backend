import { Module } from '@nestjs/common';

import { ClinicianController } from './clinician.controller';
import { ClinicianService } from './clinician.service';

@Module({
  controllers: [ClinicianController],
  providers: [ClinicianService],
})
export class ClinicianModule {}
