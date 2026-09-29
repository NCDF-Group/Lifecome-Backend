import { createZodDto } from '../../../common/validation/zod-dto';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { z } from 'zod';

export const ListConsentRecordsQuerySchema = PaginationQuerySchema.extend({
  consentType: z.enum(['terms_of_use', 'privacy_notice', 'clinical_treatment', 'record_sharing']).optional(),
  revoked: z.coerce.boolean().optional(),
});
export class ListConsentRecordsQueryDto extends createZodDto(ListConsentRecordsQuerySchema) {}

export const GrantConsentSchema = z.object({
  patientId: z.uuid(),
  consentType: z.enum(['terms_of_use', 'privacy_notice', 'clinical_treatment', 'record_sharing']),
  documentVersion: z.string().min(1).max(50),
  channel: z.string().max(50).default('app'),
});
export class GrantConsentDto extends createZodDto(GrantConsentSchema) {}
