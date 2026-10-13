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
  address: z.string().max(255).optional(),
  bloodGroup: z.string().max(10).optional(),
  genotype: z.string().max(10).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(40).optional(),
  emergencyContactRelationship: z.string().max(50).optional(),
});
export class CreatePatientProfileDto extends createZodDto(CreatePatientProfileSchema) {}

export const UpdatePatientProfileSchema = CreatePatientProfileSchema.partial().omit({ userAccountId: true });
export class UpdatePatientProfileDto extends createZodDto(UpdatePatientProfileSchema) {}

/** `PUT /me/profile` - the signed-in patient creates or updates their own profile. */
export const UpsertMyProfileSchema = CreatePatientProfileSchema.omit({ userAccountId: true });
export class UpsertMyProfileDto extends createZodDto(UpsertMyProfileSchema) {}

/** `PATCH /me/profile` - any subset of the profile fields (the profile must already exist). */
export const PatchMyProfileSchema = UpsertMyProfileSchema.partial();
export class PatchMyProfileDto extends createZodDto(PatchMyProfileSchema) {}

export const CreateDependantSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  dateOfBirth: z.iso.date(),
  gender: z.string().max(30).optional(),
  bloodGroup: z.string().max(10).optional(),
  genotype: z.string().max(10).optional(),
  status: z.enum(['Covered', 'Approved', 'Pending']).default('Covered'),
});
export class CreateDependantDto extends createZodDto(CreateDependantSchema) {}

export const UpdateDependantSchema = CreateDependantSchema.partial();
export class UpdateDependantDto extends createZodDto(UpdateDependantSchema) {}
