import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const CareAssessmentRequestSchema = z.object({
  forWhom: z.enum(['myself', 'someone_else']).default('myself'),
  recipientName: z.string().max(200).optional(),
  recipientRelationship: z.string().max(100).optional(),
  authorityEstablished: z.boolean().default(false),
  postcode: z.string().min(2).max(20),
  supportRequested: z.array(z.string()).min(1),
  preferredContactMethod: z.enum(['phone', 'email', 'in_app']).default('phone'),
  preferredContactTimes: z.string().max(200).optional(),
  accessibilityNeeds: z.string().max(1000).optional(),
  additionalNotes: z.string().max(2000).optional(),
});
export class CareAssessmentRequestDto extends createZodDto(CareAssessmentRequestSchema) {}

export const RequestChangeCareArrangementSchema = z.object({
  changeType: z.enum(['schedule_change', 'support_level', 'provider_preference', 'cancellation', 'other']),
  details: z.string().min(5).max(2000),
  requestedEffectiveDate: z.string().optional(),
});
export class RequestChangeCareArrangementDto extends createZodDto(RequestChangeCareArrangementSchema) {}

export const CancelCareVisitSchema = z.object({
  reason: z.string().min(3).max(1000),
});
export class CancelCareVisitDto extends createZodDto(CancelCareVisitSchema) {}

export const ChangeCareVisitSchema = z.object({
  requestedDate: z.string(),
  reason: z.string().min(3).max(1000),
});
export class ChangeCareVisitDto extends createZodDto(ChangeCareVisitSchema) {}

export const CareUrgentReportSchema = z.object({
  visitId: z.string().uuid().optional(),
  issueType: z.enum(['missed_visit', 'caregiver_late', 'immediate_assistance', 'other']),
  description: z.string().min(5).max(2000),
});
export class CareUrgentReportDto extends createZodDto(CareUrgentReportSchema) {}
