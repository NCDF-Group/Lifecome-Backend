import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

/** What the patient picked on "What do you need help with?". */
export const MessageTopicSchema = z.enum(['booking_payments', 'online_appointment', 'clinic_visit', 'follow_up']);

/** `POST /message-threads` - the patient starts a conversation with the care team. */
export const CreateMyThreadSchema = z.object({
  topic: MessageTopicSchema,
  body: z.string().trim().min(1).max(4000),
});
export class CreateMyThreadDto extends createZodDto(CreateMyThreadSchema) {}

/** `POST /message-threads/:id/messages` - a patient reply, or a care-team reply from the console. */
export const SendMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
export class SendMessageDto extends createZodDto(SendMessageSchema) {}

export const ListThreadsAdminQuerySchema = PaginationQuerySchema.extend({
  topic: MessageTopicSchema.optional(),
});
export class ListThreadsAdminQueryDto extends createZodDto(ListThreadsAdminQuerySchema) {}
