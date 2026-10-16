import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const MenopauseAssessmentSchema = z.object({
  symptoms: z.record(z.string(), z.any()),
  hrtHistory: z.string().max(1000).optional(),
  medicalHistory: z.string().max(2000).optional(),
  currentMedications: z.string().max(1000).optional(),
  goals: z.string().max(1000).optional(),
});
export class MenopauseAssessmentDto extends createZodDto(MenopauseAssessmentSchema) {}

export const BookTreatmentReviewSchema = z.object({
  assessmentId: z.string().uuid().optional(),
  preferredChannel: z.enum(['video', 'audio', 'in_person']).default('video'),
  clinicId: z.string().uuid().optional(),
  preferredClinicianId: z.string().uuid().optional(),
  currentSymptomsSummary: z.string().max(1000).optional(),
});
export class BookTreatmentReviewDto extends createZodDto(BookTreatmentReviewSchema) {}

export const CreateClinicSchema = z.object({
  name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(300),
  postcode: z.string().min(3).max(20),
  phone: z.string().min(5).max(40),
  accessibilityDetails: z.string().max(500),
  directions: z.string().max(1000),
  arrivalInstructions: z.string().max(1000),
});
export class CreateClinicDto extends createZodDto(CreateClinicSchema) {}
