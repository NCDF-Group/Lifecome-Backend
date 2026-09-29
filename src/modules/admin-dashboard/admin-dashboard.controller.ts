import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { AdminDashboardService, type DashboardSummary } from './admin-dashboard.service';
import { AdminLocationsService, type LocationsOverview } from './admin-locations.service';

/** `/admin/dashboard` and `/admin/locations` — see each service's doc comment for what they cover. */
@ApiTags('admin-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminDashboardController {
  constructor(
    private readonly dashboard: AdminDashboardService,
    private readonly locations: AdminLocationsService,
  ) {}

  @Get('dashboard')
  getDashboard(): Promise<DashboardSummary> {
    return this.dashboard.getSummary();
  }

  @Get('locations')
  getLocations(): Promise<LocationsOverview> {
    return this.locations.getOverview();
  }
}
