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

/** Sets the account's password once its email is verified — its own step after `otp/verify`,
 * not part of registration, since sign-up verifies the email first (see `IdentityService`). */
export const SetPasswordSchema = z.object({
  userAccountId: z.uuid(),
  password: z.string().min(8).max(200),
});

export class SetPasswordDto extends createZodDto(SetPasswordSchema) {}

export const PatientLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export class PatientLoginDto extends createZodDto(PatientLoginSchema) {}

export const RequestPasswordResetSchema = z.object({
  email: z.email(),
});

export class RequestPasswordResetDto extends createZodDto(RequestPasswordResetSchema) {}

export const VerifyPasswordResetCodeSchema = z.object({
  email: z.email(),
  code: z.string().length(6),
});

export class VerifyPasswordResetCodeDto extends createZodDto(VerifyPasswordResetCodeSchema) {}

export const ConfirmPasswordResetSchema = z.object({
  email: z.email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(200),
});

export class ConfirmPasswordResetDto extends createZodDto(ConfirmPasswordResetSchema) {}
