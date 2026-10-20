import { createZodDto } from '../../../common/validation/zod-dto';
import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  /** E.164-ish; loosely validated here. Kept as a patient contact number; verification uses email. */
  phoneNumber: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+?[0-9]+$/, 'Phone number must contain only digits and an optional leading +'),
  /** Set immediately at registration — sign-up no longer has a separate "create password" step
   * after verification (see `IdentityService.register`). */
  password: z.string().min(8).max(200),
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
