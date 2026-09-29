import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const ProviderNetworkStatusSchema = z.enum(['active', 'suspended', 'pending_review']);

export const ListProvidersAdminQuerySchema = PaginationQuerySchema.extend({
  search: z.string().min(1).max(200).optional(),
  specialty: z.string().optional(),
  networkStatus: ProviderNetworkStatusSchema.optional(),
});
export class ListProvidersAdminQueryDto extends createZodDto(ListProvidersAdminQuerySchema) {}

export const UpdateProviderNetworkStatusSchema = z.object({
  networkStatus: ProviderNetworkStatusSchema,
});
export class UpdateProviderNetworkStatusDto extends createZodDto(UpdateProviderNetworkStatusSchema) {}

export const CreateProviderSchema = z.object({
  displayName: z.string().min(1).max(200),
  specialty: z.string().min(1).max(120),
  languages: z.array(z.string().min(1)).default([]),
  consultationModes: z.array(z.enum(['video', 'audio'])).default(['video']),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
});
export class CreateProviderDto extends createZodDto(CreateProviderSchema) {}

export const ListProvidersQuerySchema = z.object({
  specialty: z.string().optional(),
  language: z.string().optional(),
});
export class ListProvidersQueryDto extends createZodDto(ListProvidersQuerySchema) {}
