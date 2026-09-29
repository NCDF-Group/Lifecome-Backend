import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { DRIZZLE, type Database } from '../../../db/client';
import { notificationLogs } from '../../../db/schema';
import { QUEUE_NAMES } from '../../../queue/queue.module';
import type { NotificationJobData } from '../notifications.service';

/**
 * The worked example the module's README points to. No SMS/email/push provider is configured in
 * this scaffold, so this just logs what it would have sent — never the full `data` payload
 * (which may carry patient information), only the template name and channel, matching the
 * "no unnecessary clinical detail" rule (blueprint §15). Swap the `send` case bodies for real
 * provider calls once TERMII_API_KEY / an email provider / FCM are configured.
 *
 * Either way, it updates the `notification_logs` row `NotificationsService.enqueue` wrote, so
 * `/admin/notifications` reflects what actually happened to the job.
 */
@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationsProcessor extends WorkerHost {
  constructor(
    @InjectPinoLogger(NotificationsProcessor.name) private readonly logger: PinoLogger,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { channel, template, recipientUserAccountId, logId } = job.data;
    try {
      this.logger.info({ channel, template, recipientUserAccountId, jobId: job.id }, 'Notification would be sent here');
      await this.db.update(notificationLogs).set({ status: 'sent', updatedAt: new Date() }).where(eq(notificationLogs.id, logId));
    } catch (error) {
      const failureReason = error instanceof Error ? error.message : 'Unknown error';
      await this.db
        .update(notificationLogs)
        .set({ status: 'failed', failureReason, updatedAt: new Date() })
        .where(eq(notificationLogs.id, logId));
      throw error;
    }
  }
}
