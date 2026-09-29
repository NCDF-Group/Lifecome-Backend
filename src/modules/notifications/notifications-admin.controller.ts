import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { ListNotificationLogsQueryDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

/** `/admin/notifications` — the "Notifications" page in the operations console. */
@ApiTags('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/notifications')
export class NotificationsAdminController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Query() query: ListNotificationLogsQueryDto) {
    return this.notifications.adminList(query);
  }
}
