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
  consultationMode: z.enum(['video', 'audio', 'in_person']).default('video'),
  presentingConcern: z.string().max(2000).optional(),
  fundingRoute: z.enum(['pay_per_visit', 'lifecome_benefits', 'workplace', 'membership']).default('pay_per_visit'),
  /** In-person visits only. */
  locationCity: z.string().max(100).optional(),
  clinicName: z.string().max(200).optional(),
  intake: z
    .object({
      reason: z.string().max(2000).optional(),
      medicinesAndAllergies: z.string().max(2000).optional(),
      accessibilitySupport: z.string().max(1000).optional(),
      callbackNumber: z.string().max(40).optional(),
      patientLocation: z.string().max(500).optional(),
      understoodRemoteLimits: z.boolean().optional(),
    })
    .optional(),
});
export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
