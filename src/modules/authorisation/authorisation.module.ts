import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { PayerModule } from '../payer/payer.module';
import { AuthorisationController } from './authorisation.controller';
import { AuthorisationService } from './authorisation.service';

@Module({
  imports: [PayerModule, AuditModule],
  controllers: [AuthorisationController],
  providers: [AuthorisationService],
  exports: [AuthorisationService],
})
export class AuthorisationModule {}
