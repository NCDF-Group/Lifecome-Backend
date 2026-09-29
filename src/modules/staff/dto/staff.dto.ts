import { z } from 'zod';

import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';

export const StaffRoleSchema = z.enum([
  'platform_administrator',
  'clinical_administrator',
  'hmo_operations',
  'support_agent',
]);

export const StaffStatusSchema = z.enum(['active', 'suspended']);

export const CreateStaffSchema = z.object({
  email: z.email(),
  password: z.string().min(10).max(200),
  fullName: z.string().min(1).max(200),
  role: StaffRoleSchema,
});
export class CreateStaffDto extends createZodDto(CreateStaffSchema) {}

export const UpdateStaffSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  role: StaffRoleSchema.optional(),
  status: StaffStatusSchema.optional(),
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

/** Max decoded size of a profile photo. The console sends a 256px image, well under this. */
export const MAX_AVATAR_BYTES = 512 * 1024;

/** `PUT /admin/staff/me/avatar` — base64 in JSON rather than multipart, since the payload is small
 * and this keeps the API on one body format (no @fastify/multipart dependency for one route). */
export const UploadAvatarSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  // base64 is ~4/3 of the byte length; the decoded size is checked again in the service.
  data: z.base64().max(Math.ceil((MAX_AVATAR_BYTES * 4) / 3) + 4),
});
export class UploadAvatarDto extends createZodDto(UploadAvatarSchema) {}

export const ListStaffQuerySchema = PaginationQuerySchema.extend({
  role: StaffRoleSchema.optional(),
  status: StaffStatusSchema.optional(),
});
export class ListStaffQueryDto extends createZodDto(ListStaffQuerySchema) {}
