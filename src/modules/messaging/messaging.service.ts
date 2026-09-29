import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { messageThreads, messages } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { CreateThreadDto, SendMessageDto } from './dto/messaging.dto';

export type MessageThread = typeof messageThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;

/** View 22 — Care Team Messages. */
@Injectable()
export class MessagingService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async createThread(input: CreateThreadDto): Promise<MessageThread> {
    const [thread] = await this.db.insert(messageThreads).values(input).returning();
    return thread;
  }

  listThreadsForPatient(patientId: string): Promise<MessageThread[]> {
    return this.db.select().from(messageThreads).where(eq(messageThreads.patientId, patientId));
  }

  async send(threadId: string, input: SendMessageDto): Promise<Message> {
    const [thread] = await this.db.select().from(messageThreads).where(eq(messageThreads.id, threadId));
    if (!thread) throw new NotFoundAppException('Message thread');

    const [message] = await this.db.insert(messages).values({ threadId, ...input }).returning();
    return message;
  }

  listMessages(threadId: string): Promise<Message[]> {
    return this.db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(asc(messages.sentAt));
  }
}
