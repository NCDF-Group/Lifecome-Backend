import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { ListVisitsQueryDto } from './dto/visits.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@UseGuards(PatientAuthGuard)
@Controller('me/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  /**
   * Unified Visits endpoint (Page 2 & 6).
   * Aggregates upcoming and past GP appointments, wellbeing sessions and confirmed care visits,
   * filterable by service (?service=all|gp|care|wellbeing) and timeframe (?timeframe=all|upcoming|past).
   */
  @Get()
  listVisits(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Query() query: ListVisitsQueryDto,
  ) {
    return this.visitsService.listVisits(account.sub, query);
  }
}
