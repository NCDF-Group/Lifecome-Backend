import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceHubService } from './service-hub.service';

@ApiTags('service-hub')
@Controller('services')
export class ServiceHubController {
  constructor(private readonly serviceHub: ServiceHubService) {}

  @Get('overview')
  getOverview() {
    return this.serviceHub.getOverview();
  }

  @Get('emergency-guidance')
  getEmergencyGuidance() {
    return this.serviceHub.getEmergencyGuidance();
  }
}
