import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const ListPatientsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().min(1).max(200).optional(),
});
export class ListPatientsQueryDto extends createZodDto(ListPatientsQuerySchema) {}

export const CreatePatientProfileSchema = z.object({
  userAccountId: z.uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.iso.date(),
  sex: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  /** ISO 3166-1 alpha-2 — the UK is `GB`, not `UK`. Omitted means `NG` (the column default). */
  country: z.enum(['NG', 'GB']).optional(),
});
export class CreatePatientProfileDto extends createZodDto(CreatePatientProfileSchema) {}

export const UpdatePatientProfileSchema = CreatePatientProfileSchema.partial().omit({ userAccountId: true });
export class UpdatePatientProfileDto extends createZodDto(UpdatePatientProfileSchema) {}
