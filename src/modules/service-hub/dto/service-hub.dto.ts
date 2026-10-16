import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const ServiceOverviewItemSchema = z.object({
  id: z.enum(['gp', 'care', 'wellbeing', 'insurance']),
  title: z.string(),
  headline: z.string(),
  description: z.string(),
  mainAction: z.string(),
  destinationRoute: z.string(),
  icon: z.string(),
  status: z.enum(['ready_for_launch', 'active']).default('ready_for_launch'),
  features: z.array(z.string()),
});
export class ServiceOverviewItemDto extends createZodDto(ServiceOverviewItemSchema) {}

export const ServiceOverviewResponseSchema = z.object({
  headline: z.string(),
  supportingText: z.string(),
  services: z.array(ServiceOverviewItemSchema),
  accountActions: z.object({
    createAccount: z.string(),
    login: z.string(),
  }),
});
export class ServiceOverviewResponseDto extends createZodDto(ServiceOverviewResponseSchema) {}
