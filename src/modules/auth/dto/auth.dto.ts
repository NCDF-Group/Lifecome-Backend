import { z } from 'zod';

import { createZodDto } from '../../../common/validation/zod-dto';

export const StaffLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export class StaffLoginDto extends createZodDto(StaffLoginSchema) {}
