import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateThreadSchema = z.object({
  patientId: z.uuid(),
  subject: z.string().max(200).optional(),
});
export class CreateThreadDto extends createZodDto(CreateThreadSchema) {}

export const SendMessageSchema = z.object({
  senderType: z.enum(['patient', 'care_team']),
  senderId: z.uuid(),
  body: z.string().min(1).max(4000),
});
export class SendMessageDto extends createZodDto(SendMessageSchema) {}
