import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentStaff, JwtAuthGuard, Roles, RolesGuard, type StaffTokenPayload } from '../../common/auth/common-auth.module';
import { ListThreadsAdminQueryDto, SendMessageDto } from './dto/messaging.dto';
import { MessagingService, type AdminThreadRow, type Message } from './messaging.service';

/** `/admin/messaging` - the "Messaging" page in the operations console: the patient support inbox. */
@ApiTags('messaging')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_administrator', 'support_agent', 'clinical_administrator')
@Controller('admin/messaging')
export class MessagingAdminController {
  constructor(private readonly messaging: MessagingService) {}

  @Get('threads')
  list(@Query() query: ListThreadsAdminQueryDto) {
    return this.messaging.adminList(query);
  }

  @Get('threads/:id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminThreadRow & { messages: Message[] }> {
    return this.messaging.adminGetThread(id);
  }

  @Post('threads/:id/messages')
  reply(
    @CurrentStaff() staff: StaffTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SendMessageDto,
  ): Promise<Message> {
    return this.messaging.adminReply(id, staff.sub, body);
  }
}
