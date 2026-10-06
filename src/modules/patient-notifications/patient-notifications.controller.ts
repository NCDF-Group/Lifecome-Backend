import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { PatientNotificationsService, type PatientNotification } from './patient-notifications.service';

/** `/me/notifications` - the signed-in patient's own in-app notification feed. */
@ApiTags('notifications')
@UseGuards(PatientAuthGuard)
@Controller('me/notifications')
export class PatientNotificationsController {
  constructor(private readonly notifications: PatientNotificationsService) {}

  @Get()
  list(@CurrentPatientAccount() account: PatientAccountToken): Promise<{ items: PatientNotification[]; unreadCount: number }> {
    return this.notifications.list(account.sub);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  readAll(@CurrentPatientAccount() account: PatientAccountToken): Promise<void> {
    return this.notifications.markAllRead(account.sub);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  read(@CurrentPatientAccount() account: PatientAccountToken, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notifications.markRead(account.sub, id);
  }
}
