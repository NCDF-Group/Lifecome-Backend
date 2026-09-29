import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const ListAuditEventsQuerySchema = PaginationQuerySchema.extend({
  actorType: z.enum(['patient', 'provider', 'staff', 'system']).optional(),
  resourceType: z.string().optional(),
});
export class ListAuditEventsQueryDto extends createZodDto(ListAuditEventsQuerySchema) {}
