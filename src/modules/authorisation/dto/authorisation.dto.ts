import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const RequestAuthorisationSchema = z.object({
  eligibilityCheckId: z.uuid(),
  clinicalServiceCode: z.string().min(1),
  providerId: z.uuid(),
  appointmentId: z.uuid(),
});
export class RequestAuthorisationDto extends createZodDto(RequestAuthorisationSchema) {}
