import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.email(),
  /** Optional contact info only - never used to sign in or verify anything (email OTP is).
   * E.164-ish; loosely validated here, normalised properly once a real SMS provider is wired in
   * for things like appointment reminders. */
  phoneNumber: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+?[0-9]+$/, 'Phone number must contain only digits and an optional leading +')
    .optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}

export const VerifyOtpSchema = z.object({
  userAccountId: z.uuid(),
  code: z.string().length(6),
});

export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}

export const RequestOtpSchema = z.object({
  userAccountId: z.uuid(),
});

export class RequestOtpDto extends createZodDto(RequestOtpSchema) {}
