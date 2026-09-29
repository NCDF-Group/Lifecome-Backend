import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { ConsentService } from './consent.service';
import { ListConsentRecordsQueryDto } from './dto/consent.dto';

/** `/admin/consent` — the "Consent" page in the operations console (every patient, not one). */
@ApiTags('consent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/consent')
export class ConsentAdminController {
  constructor(private readonly consent: ConsentService) {}

  @Get()
  list(@Query() query: ListConsentRecordsQueryDto) {
    return this.consent.adminList(query);
  }
}
