import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PayerModule } from '../payer/payer.module';
import { EligibilityAdminController } from './eligibility-admin.controller';
import { EligibilityController } from './eligibility.controller';
import { EligibilityService } from './eligibility.service';

@Module({
  imports: [PayerModule, AuditModule],
  controllers: [EligibilityController, EligibilityAdminController],
  providers: [EligibilityService],
  exports: [EligibilityService],
})
export class EligibilityModule {}
