import { Module } from '@nestjs/common';
import { ServiceHubController } from './service-hub.controller';
import { ServiceHubService } from './service-hub.service';

@Module({
  controllers: [ServiceHubController],
  providers: [ServiceHubService],
  exports: [ServiceHubService],
})
export class ServiceHubModule {}
