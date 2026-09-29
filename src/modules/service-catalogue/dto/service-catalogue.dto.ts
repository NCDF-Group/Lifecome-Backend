import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateClinicalServiceSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  defaultDurationMinutes: z.number().int().positive().max(240).default(30),
  basePriceKobo: z.number().int().nonnegative(),
});
export class CreateClinicalServiceDto extends createZodDto(CreateClinicalServiceSchema) {}
