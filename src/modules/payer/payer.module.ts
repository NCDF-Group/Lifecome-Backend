import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { FakePayerAdapter } from './adapters/fake-payer.adapter';
import { PayerAdapterRegistry } from './adapters/payer-adapter.registry';
import { PayerController } from './payer.controller';
import { PayerService } from './payer.service';

@Module({
  imports: [AuditModule],
  controllers: [PayerController],
  providers: [PayerService, PayerAdapterRegistry, FakePayerAdapter],
  exports: [PayerService, PayerAdapterRegistry],
})
export class PayerModule {}
