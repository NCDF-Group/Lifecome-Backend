import { z } from 'zod';

import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { createZodDto } from '../../../common/validation/zod-dto';

export const ClinicianAppointmentsQuerySchema = PaginationQuerySchema.extend({
  /** `upcoming` = starts now or later (soonest first); `past` = already started (latest first). */
  scope: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
  status: z.enum(['slot_held', 'confirmed', 'rescheduled', 'cancelled', 'doctor_unavailable', 'patient_no_show']).optional(),
});
export class ClinicianAppointmentsQueryDto extends createZodDto(ClinicianAppointmentsQuerySchema) {}

export const ClinicianCreateSlotSchema = z.object({
  startsAt: z.iso.datetime(),
  durationMinutes: z.number().int().positive().max(240).default(30),
});
export class ClinicianCreateSlotDto extends createZodDto(ClinicianCreateSlotSchema) {}
