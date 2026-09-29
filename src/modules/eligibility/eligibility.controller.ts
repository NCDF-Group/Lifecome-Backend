import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CheckEligibilityDto } from './dto/eligibility.dto';
import { EligibilityService, type EligibilityCheck } from './eligibility.service';

@ApiTags('eligibility')
@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibility: EligibilityService) {}

  /** View 09 — Check Service Eligibility. */
  @Post('check')
  check(@Body() body: CheckEligibilityDto): Promise<EligibilityCheck> {
    return this.eligibility.check(body.membershipId, body.clinicalServiceCode);
  }
}
