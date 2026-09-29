import { Module } from '@nestjs/common';

import { CareCoordinationController } from './care-coordination.controller';
import { CareCoordinationService } from './care-coordination.service';

@Module({
  controllers: [CareCoordinationController],
  providers: [CareCoordinationService],
  exports: [CareCoordinationService],
})
export class CareCoordinationModule {}
