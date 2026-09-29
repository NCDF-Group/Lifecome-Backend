import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { ListEligibilityChecksQueryDto } from './dto/eligibility.dto';
import { EligibilityService } from './eligibility.service';

/** `/admin/eligibility-checks` — the "Eligibility" page in the operations console. */
@ApiTags('eligibility')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/eligibility-checks')
export class EligibilityAdminController {
  constructor(private readonly eligibility: EligibilityService) {}

  @Get()
  list(@Query() query: ListEligibilityChecksQueryDto) {
    return this.eligibility.adminList(query);
  }
}
