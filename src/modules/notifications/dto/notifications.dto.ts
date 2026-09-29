import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const ListNotificationLogsQuerySchema = PaginationQuerySchema.extend({
  channel: z.enum(['sms', 'email', 'push', 'in_app']).optional(),
  status: z.enum(['queued', 'sent', 'failed']).optional(),
});
export class ListNotificationLogsQueryDto extends createZodDto(ListNotificationLogsQuerySchema) {}

/**
 * `template` names a versioned template (blueprint §15 — "all notification templates should be
 * versioned, localisable, testable and linked to event IDs"); the actual copy lives with whatever
 * channel provider is chosen, not in this service.
 */
export const EnqueueNotificationSchema = z.object({
  recipientUserAccountId: z.uuid(),
  channel: z.enum(['sms', 'email', 'push', 'in_app']),
  template: z.string().min(1).max(100),
  data: z.record(z.string(), z.unknown()).default({}),
});
export class EnqueueNotificationDto extends createZodDto(EnqueueNotificationSchema) {}
