import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { EnqueueNotificationDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_administrator')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post()
  @Idempotent()
  enqueue(@Body() body: EnqueueNotificationDto): Promise<{ jobId: string }> {
    return this.notifications.enqueue(body);
  }
}
