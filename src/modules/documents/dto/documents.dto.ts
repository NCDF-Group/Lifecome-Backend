import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateDocumentSchema = z.object({
  patientId: z.uuid(),
  encounterId: z.uuid().optional(),
  documentType: z.string().min(1).max(100),
  objectKey: z.string().min(1).max(1000),
  uploadedByProviderId: z.uuid().optional(),
});
export class CreateDocumentDto extends createZodDto(CreateDocumentSchema) {}
