import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const BookingStatusSchema = z.enum([
  'slot_held',
  'confirmed',
  'rescheduled',
  'cancelled',
  'doctor_unavailable',
  'patient_no_show',
]);

export const ListAppointmentsQuerySchema = PaginationQuerySchema.extend({
  status: BookingStatusSchema.optional(),
  patientId: z.uuid().optional(),
  providerId: z.uuid().optional(),
});
export class ListAppointmentsQueryDto extends createZodDto(ListAppointmentsQuerySchema) {}

export const CreateAppointmentSchema = z.object({
  patientId: z.uuid(),
  providerId: z.uuid(),
  clinicalServiceId: z.uuid(),
  availabilitySlotId: z.uuid(),
  consultationMode: z.enum(['video', 'audio']).default('video'),
  presentingConcern: z.string().max(2000).optional(),
});
export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
