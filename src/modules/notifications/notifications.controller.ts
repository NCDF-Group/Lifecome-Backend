import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { EnqueueNotificationDto } from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post()
  @Idempotent()
  enqueue(@Body() body: EnqueueNotificationDto): Promise<{ jobId: string }> {
    return this.notifications.enqueue(body);
  }
}
