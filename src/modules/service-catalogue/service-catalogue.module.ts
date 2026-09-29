import { Module } from '@nestjs/common';

import { ServiceCatalogueController } from './service-catalogue.controller';
import { ServiceCatalogueService } from './service-catalogue.service';

@Module({
  controllers: [ServiceCatalogueController],
  providers: [ServiceCatalogueService],
  exports: [ServiceCatalogueService],
})
export class ServiceCatalogueModule {}
