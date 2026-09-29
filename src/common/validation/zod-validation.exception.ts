import type { ZodError } from 'zod';

/** Thrown by `ZodValidationPipe`; rendered by the global `HttpExceptionFilter` as a 400 with per-field issues. */
export class ZodValidationException extends Error {
  constructor(private readonly zodError: ZodError) {
    super('Validation failed');
    this.name = 'ZodValidationException';
  }

  getZodError(): ZodError {
    return this.zodError;
  }
}
