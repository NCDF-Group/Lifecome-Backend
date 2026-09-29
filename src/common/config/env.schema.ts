import { z } from 'zod';

/**
 * Validated at boot (see main.ts). The process refuses to start if a required variable is
 * missing or malformed, rather than failing later with a confusing runtime error.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim())),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.url(),
  REDIS_URL: z.url().default('redis://localhost:6379'),

  SESSION_JWT_SECRET: z.string().min(16, 'SESSION_JWT_SECRET must be at least 16 characters'),

  // Signs the operations-console staff JWT (see common/auth/) — deliberately a separate secret
  // from SESSION_JWT_SECRET, which is only ever an OTP-hashing pepper for patient sign-in.
  STAFF_JWT_SECRET: z.string().min(16, 'STAFF_JWT_SECRET must be at least 16 characters'),

  // Integration credentials are optional in every environment except production, where the
  // relevant module (payment, notifications, consultation) fails fast if it is actually used
  // without one configured — see each module's README.
  PAYSTACK_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  TERMII_API_KEY: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
