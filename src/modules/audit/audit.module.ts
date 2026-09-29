import { Module } from '@nestjs/common';

import { AuditAdminController } from './audit-admin.controller';
import { AuditService } from './audit.service';

/**
 * `AuditAdminController` is the only way to read this log back — every other module writes to it
 * via `AuditService.record` (imported directly, not through this controller) and never reads it.
 */
@Module({
  controllers: [AuditAdminController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
