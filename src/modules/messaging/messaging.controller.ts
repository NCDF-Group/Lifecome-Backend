import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateThreadDto, SendMessageDto } from './dto/messaging.dto';
import { MessagingService, type Message, type MessageThread } from './messaging.service';

@ApiTags('messaging')
@Controller('message-threads')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Post()
  createThread(@Body() body: CreateThreadDto): Promise<MessageThread> {
    return this.messaging.createThread(body);
  }

  @Get('patients/:patientId')
  listForPatient(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<MessageThread[]> {
    return this.messaging.listThreadsForPatient(patientId);
  }

  @Get(':id/messages')
  listMessages(@Param('id', ParseUUIDPipe) id: string): Promise<Message[]> {
    return this.messaging.listMessages(id);
  }

  @Post(':id/messages')
  send(@Param('id', ParseUUIDPipe) id: string, @Body() body: SendMessageDto): Promise<Message> {
    return this.messaging.send(id, body);
  }
}
