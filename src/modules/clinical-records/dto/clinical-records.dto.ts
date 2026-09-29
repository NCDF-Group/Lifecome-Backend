import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CreateEncounterSchema = z.object({
  appointmentId: z.uuid(),
  patientId: z.uuid(),
  providerId: z.uuid(),
});
export class CreateEncounterDto extends createZodDto(CreateEncounterSchema) {}

export const CreateClinicalNoteSchema = z.object({
  authorProviderId: z.uuid(),
  body: z.string().min(1).max(20_000),
});
export class CreateClinicalNoteDto extends createZodDto(CreateClinicalNoteSchema) {}

export const SignClinicalNoteSchema = z.object({
  authorProviderId: z.uuid(),
});
export class SignClinicalNoteDto extends createZodDto(SignClinicalNoteSchema) {}

export const AmendClinicalNoteSchema = z.object({
  authorProviderId: z.uuid(),
  body: z.string().min(1).max(20_000),
});
export class AmendClinicalNoteDto extends createZodDto(AmendClinicalNoteSchema) {}

export const CreateCarePlanSchema = z.object({
  summary: z.string().min(1).max(10_000),
  followUpDueAt: z.iso.datetime().optional(),
});
export class CreateCarePlanDto extends createZodDto(CreateCarePlanSchema) {}

export const CreatePrescriptionSchema = z.object({
  prescribedByProviderId: z.uuid(),
  medicationName: z.string().min(1).max(300),
  instructions: z.string().min(1).max(2000),
});
export class CreatePrescriptionDto extends createZodDto(CreatePrescriptionSchema) {}

export const CreateReferralSchema = z.object({
  referredByProviderId: z.uuid(),
  reason: z.string().min(1).max(2000),
  referredToDescription: z.string().min(1).max(500),
});
export class CreateReferralDto extends createZodDto(CreateReferralSchema) {}

export const CreateDiagnosticOrderSchema = z.object({
  orderedByProviderId: z.uuid(),
  testName: z.string().min(1).max(300),
});
export class CreateDiagnosticOrderDto extends createZodDto(CreateDiagnosticOrderSchema) {}

export const CreateDiagnosticResultSchema = z.object({
  originatingProviderName: z.string().min(1).max(300),
  resultSummary: z.string().max(10_000).optional(),
});
export class CreateDiagnosticResultDto extends createZodDto(CreateDiagnosticResultSchema) {}

export const ReviewDiagnosticResultSchema = z.object({
  reviewedByProviderId: z.uuid(),
});
export class ReviewDiagnosticResultDto extends createZodDto(ReviewDiagnosticResultSchema) {}
