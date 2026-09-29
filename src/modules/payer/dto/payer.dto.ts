import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const VerifyMembershipSchema = z.object({
  patientId: z.uuid(),
  payerCode: z.string().min(1),
  memberId: z.string().min(1),
});
export class VerifyMembershipDto extends createZodDto(VerifyMembershipSchema) {}
