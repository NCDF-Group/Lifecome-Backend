import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { AuditService } from './audit.service';
import { ListAuditEventsQueryDto } from './dto/audit.dto';

/**
 * `/admin/audit-events` — the "Audit log" page in the operations console. The only way to read
 * the hash-chained log `AuditService.record` writes; nothing here can modify it.
 */
@ApiTags('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit-events')
export class AuditAdminController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: ListAuditEventsQueryDto) {
    return this.audit.list(query);
  }
}
