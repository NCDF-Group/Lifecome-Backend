import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const ListVisitsQuerySchema = z.object({
  service: z.enum(['all', 'gp', 'care', 'wellbeing']).default('all'),
  timeframe: z.enum(['all', 'upcoming', 'past']).default('all'),
});
export class ListVisitsQueryDto extends createZodDto(ListVisitsQuerySchema) {}
