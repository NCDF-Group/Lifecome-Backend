import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

const CONSULTATION_STATUSES = [
  'booked',
  'check_in_open',
  'device_check',
  'waiting',
  'clinician_joining',
  'connected',
  'reconnecting',
  'audio_fallback',
  'ended',
] as const;

export const TransitionConsultationSchema = z.object({
  status: z.enum(CONSULTATION_STATUSES),
});
export class TransitionConsultationDto extends createZodDto(TransitionConsultationSchema) {}
