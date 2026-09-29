import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { and, count, desc, eq, getTableColumns } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { notificationLogs, userAccounts } from '../../db/schema';
import { QUEUE_NAMES } from '../../queue/queue.module';
import type { EnqueueNotificationDto, ListNotificationLogsQueryDto } from './dto/notifications.dto';

const RETRY_ATTEMPTS = 5;

export type NotificationLog = typeof notificationLogs.$inferSelect;

/** A notification-log row joined with the recipient's contact details `/admin/notifications` shows. */
export type AdminNotificationLogRow = NotificationLog & {
  recipientPhoneNumber: string;
  recipientEmail: string | null;
};

/** A job payload plus the log row id `NotificationsProcessor` updates once the job runs. */
export interface NotificationJobData extends EnqueueNotificationDto {
  logId: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly queue: Queue,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {}

  async enqueue(input: EnqueueNotificationDto): Promise<{ jobId: string }> {
    const [log] = await this.db
      .insert(notificationLogs)
      .values({
        recipientUserAccountId: input.recipientUserAccountId,
        channel: input.channel,
        template: input.template,
        status: 'queued',
      })
      .returning();

    const jobData: NotificationJobData = { ...input, logId: log.id };
    const job = await this.queue.add('send', jobData, {
      attempts: RETRY_ATTEMPTS,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    });

    const jobId = job.id ?? '';
    await this.db.update(notificationLogs).set({ jobId }).where(eq(notificationLogs.id, log.id));

    return { jobId };
  }

  /** `/admin/notifications` — the "Notifications" page in the operations console. */
  async adminList(query: ListNotificationLogsQueryDto): Promise<PaginatedResult<AdminNotificationLogRow>> {
    const conditions = [];
    if (query.channel) conditions.push(eq(notificationLogs.channel, query.channel));
    if (query.status) conditions.push(eq(notificationLogs.status, query.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(notificationLogs)
      .innerJoin(userAccounts, eq(notificationLogs.recipientUserAccountId, userAccounts.id))
      .where(where);

    const items = await this.db
      .select({
        ...getTableColumns(notificationLogs),
        recipientPhoneNumber: userAccounts.phoneNumber,
        recipientEmail: userAccounts.email,
      })
      .from(notificationLogs)
      .innerJoin(userAccounts, eq(notificationLogs.recipientUserAccountId, userAccounts.id))
      .where(where)
      .orderBy(desc(notificationLogs.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }
}
