import { Module } from '@nestjs/common';

import { EmailModule } from '../../common/email/email.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [EmailModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
