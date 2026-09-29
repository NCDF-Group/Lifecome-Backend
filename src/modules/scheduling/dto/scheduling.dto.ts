import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateSlotSchema = z.object({
  providerId: z.uuid(),
  startsAt: z.iso.datetime(),
  durationMinutes: z.number().int().positive().max(240).default(30),
});
export class CreateSlotDto extends createZodDto(CreateSlotSchema) {}

export const HoldSlotSchema = z.object({
  slotId: z.uuid(),
});
export class HoldSlotDto extends createZodDto(HoldSlotSchema) {}
