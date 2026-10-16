import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const WellbeingSessionTypeSchema = z.enum([
  'lifestyle_coaching',
  'healthy_eating',
  'stress_management',
]);

export const BookWellbeingSessionSchema = z.object({
  sessionType: WellbeingSessionTypeSchema,
  coachName: z.string().min(2).max(100).optional(),
  scheduledAt: z.string(), // ISO date string
  durationMinutes: z.number().int().min(15).max(120).default(45),
  notes: z.string().max(1000).optional(),
});
export class BookWellbeingSessionDto extends createZodDto(BookWellbeingSessionSchema) {}
