import { Module } from '@nestjs/common';

import { ProviderAdminController } from './provider-admin.controller';
import { ProviderDirectoryController } from './provider-directory.controller';
import { ProviderDirectoryService } from './provider-directory.service';

@Module({
  controllers: [ProviderDirectoryController, ProviderAdminController],
  providers: [ProviderDirectoryService],
  exports: [ProviderDirectoryService],
})
export class ProviderDirectoryModule {}
