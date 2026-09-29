import { Module } from '@nestjs/common';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminLocationsService } from './admin-locations.service';

@Module({
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, AdminLocationsService],
})
export class AdminDashboardModule {}
