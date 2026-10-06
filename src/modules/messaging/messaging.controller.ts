import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { CreateMyThreadDto, SendMessageDto } from './dto/messaging.dto';
import { MessagingService, type Message, type MessageThread, type ThreadSummary } from './messaging.service';

/** The signed-in patient's conversations with the care team. Always scoped to the session's patient. */
@ApiTags('messaging')
@UseGuards(PatientAuthGuard)
@Controller('message-threads')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Post()
  createThread(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CreateMyThreadDto,
  ): Promise<{ thread: MessageThread; message: Message }> {
    return this.messaging.createThreadForPatient(account.sub, body);
  }

  @Get()
  list(@CurrentPatientAccount() account: PatientAccountToken): Promise<ThreadSummary[]> {
    return this.messaging.listThreadsForPatient(account.sub);
  }

  @Get(':id/messages')
  listMessages(@CurrentPatientAccount() account: PatientAccountToken, @Param('id', ParseUUIDPipe) id: string): Promise<Message[]> {
    return this.messaging.listMessagesForPatient(account.sub, id);
  }

  @Post(':id/messages')
  send(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SendMessageDto,
  ): Promise<Message> {
    return this.messaging.sendForPatient(account.sub, id, body);
  }
}
