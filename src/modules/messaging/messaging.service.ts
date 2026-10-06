import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { DRIZZLE, type Database } from '../../db/client';
import { messageThreads, messages, patients } from '../../db/schema';
import { PatientService } from '../patient/patient.service';
import { PatientNotificationsService } from '../patient-notifications/patient-notifications.service';
import type { CreateMyThreadDto, ListThreadsAdminQueryDto, SendMessageDto } from './dto/messaging.dto';

export type MessageThread = typeof messageThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;

/** A thread with its newest message, for the list screens. */
export type ThreadSummary = MessageThread & { lastMessage: string | null; lastMessageAt: Date | null };

export type AdminThreadRow = ThreadSummary & { patientName: string };

/** View 22 - Care Team Messages. A patient only ever sees and writes to their own threads. */
@Injectable()
export class MessagingService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
    private readonly notifications: PatientNotificationsService,
  ) {}

  // ---- Patient side ---------------------------------------------------------------------------

  async createThreadForPatient(accountId: string, input: CreateMyThreadDto): Promise<{ thread: MessageThread; message: Message }> {
    const patient = await this.patients.requireProfile(accountId);
    return this.db.transaction(async (tx) => {
      const [thread] = await tx
        .insert(messageThreads)
        .values({ patientId: patient.id, topic: input.topic, subject: topicLabel(input.topic) })
        .returning();
      const [message] = await tx
        .insert(messages)
        .values({ threadId: thread.id, senderType: 'patient', senderId: patient.id, body: input.body })
        .returning();
      return { thread, message };
    });
  }

  async listThreadsForPatient(accountId: string): Promise<ThreadSummary[]> {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.threadSummaries(eq(messageThreads.patientId, patient.id));
  }

  async listMessagesForPatient(accountId: string, threadId: string): Promise<Message[]> {
    await this.ownThread(accountId, threadId);
    return this.listMessages(threadId);
  }

  async sendForPatient(accountId: string, threadId: string, input: SendMessageDto): Promise<Message> {
    const thread = await this.ownThread(accountId, threadId);
    const [message] = await this.db
      .insert(messages)
      .values({ threadId, senderType: 'patient', senderId: thread.patientId, body: input.body })
      .returning();
    return message;
  }

  /** The thread, but only if it belongs to this patient - anyone else's looks like it doesn't exist. */
  private async ownThread(accountId: string, threadId: string): Promise<MessageThread> {
    const patient = await this.patients.requireProfile(accountId);
    const [thread] = await this.db
      .select()
      .from(messageThreads)
      .where(and(eq(messageThreads.id, threadId), eq(messageThreads.patientId, patient.id)));
    if (!thread) throw new NotFoundAppException('Message thread');
    return thread;
  }

  // ---- Care-team side (operations console) ----------------------------------------------------

  async adminList(query: ListThreadsAdminQueryDto): Promise<PaginatedResult<AdminThreadRow>> {
    const where = query.topic ? eq(messageThreads.topic, query.topic) : undefined;
    const [{ total }] = await this.db.select({ total: count() }).from(messageThreads).where(where);

    const items = await this.db
      .select({
        ...getTableColumns(messageThreads),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        lastMessage: sql<string | null>`(select m.body from messages m where m.thread_id = ${messageThreads.id} order by m.sent_at desc limit 1)`,
        lastMessageAt: sql<Date | null>`(select max(m.sent_at) from messages m where m.thread_id = ${messageThreads.id})`,
      })
      .from(messageThreads)
      .innerJoin(patients, eq(messageThreads.patientId, patients.id))
      .where(where)
      .orderBy(desc(sql`coalesce((select max(m.sent_at) from messages m where m.thread_id = ${messageThreads.id}), ${messageThreads.createdAt})`))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  async adminGetThread(threadId: string): Promise<AdminThreadRow & { messages: Message[] }> {
    const [row] = await this.db
      .select({
        ...getTableColumns(messageThreads),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
      })
      .from(messageThreads)
      .innerJoin(patients, eq(messageThreads.patientId, patients.id))
      .where(eq(messageThreads.id, threadId));
    if (!row) throw new NotFoundAppException('Message thread');
    const thread = await this.listMessages(threadId);
    const last = thread[thread.length - 1];
    return { ...row, lastMessage: last?.body ?? null, lastMessageAt: last?.sentAt ?? null, messages: thread };
  }

  async adminReply(threadId: string, staffId: string, input: SendMessageDto): Promise<Message> {
    const [thread] = await this.db.select().from(messageThreads).where(eq(messageThreads.id, threadId));
    if (!thread) throw new NotFoundAppException('Message thread');
    const [message] = await this.db
      .insert(messages)
      .values({ threadId, senderType: 'care_team', senderId: staffId, body: input.body })
      .returning();

    await this.notifications.notify({
      patientId: thread.patientId,
      kind: 'support',
      body: 'Sent you a Message',
      preview: input.body.length > 160 ? `${input.body.slice(0, 157)}...` : input.body,
      actionTarget: 'messages',
      actionRef: threadId,
    });
    return message;
  }

  // ---- Shared ---------------------------------------------------------------------------------

  listMessages(threadId: string): Promise<Message[]> {
    return this.db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(asc(messages.sentAt));
  }

  private threadSummaries(where: ReturnType<typeof eq>): Promise<ThreadSummary[]> {
    return this.db
      .select({
        ...getTableColumns(messageThreads),
        lastMessage: sql<string | null>`(select m.body from messages m where m.thread_id = ${messageThreads.id} order by m.sent_at desc limit 1)`,
        lastMessageAt: sql<Date | null>`(select max(m.sent_at) from messages m where m.thread_id = ${messageThreads.id})`,
      })
      .from(messageThreads)
      .where(where)
      .orderBy(desc(messageThreads.createdAt));
  }
}

const TOPIC_LABELS: Record<string, string> = {
  booking_payments: 'Booking and payments',
  online_appointment: 'Online appointment',
  clinic_visit: 'Clinic visit',
  follow_up: 'Follow-up query',
};

function topicLabel(topic: string): string {
  return TOPIC_LABELS[topic] ?? topic;
}
