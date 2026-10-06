import { z } from 'zod';

import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';

export const StaffRoleSchema = z.enum([
  'platform_administrator',
  'clinical_administrator',
  'hmo_operations',
  'support_agent',
  'clinician',
]);

export const StaffStatusSchema = z.enum(['active', 'suspended']);

export const CreateStaffSchema = z.object({
  email: z.email(),
  password: z.string().min(10).max(200),
  fullName: z.string().min(1).max(200),
  role: StaffRoleSchema,
  /** Required for `clinician`: the provider profile this doctor's login works as. */
  providerId: z.uuid().optional(),
});
export class CreateStaffDto extends createZodDto(CreateStaffSchema) {}

export const UpdateStaffSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  role: StaffRoleSchema.optional(),
  status: StaffStatusSchema.optional(),
  providerId: z.uuid().nullable().optional(),
});
export class UpdateStaffDto extends createZodDto(UpdateStaffSchema) {}

/** `PATCH /admin/staff/me` — what a staff member may change about themselves. Email and role are
 * deliberately absent: email is the sign-in identity baked into the JWT, and role changes need a
 * platform_administrator (`PATCH /admin/staff/:id`). */
export const UpdateOwnProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
});
export class UpdateOwnProfileDto extends createZodDto(UpdateOwnProfileSchema) {}

export const ChangeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10).max(200),
});
export class ChangeOwnPasswordDto extends createZodDto(ChangeOwnPasswordSchema) {}

export { MAX_AVATAR_BYTES, UploadAvatarDto } from '../../../common/dto/avatar.dto';

export const ListStaffQuerySchema = PaginationQuerySchema.extend({
  role: StaffRoleSchema.optional(),
  status: StaffStatusSchema.optional(),
});
export class ListStaffQueryDto extends createZodDto(ListStaffQuerySchema) {}
