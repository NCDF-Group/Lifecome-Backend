import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateCareTaskSchema = z.object({
  patientId: z.uuid(),
  encounterId: z.uuid().optional(),
  assignedToProviderId: z.uuid().optional(),
  description: z.string().min(1).max(2000),
  dueAt: z.iso.datetime().optional(),
});
export class CreateCareTaskDto extends createZodDto(CreateCareTaskSchema) {}
