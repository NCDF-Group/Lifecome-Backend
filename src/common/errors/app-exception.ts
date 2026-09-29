import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * The one exception type domain code should throw. It carries a stable, machine-readable `code`
 * (for clients to branch on) separately from `message` (safe to show a patient directly) —
 * see blueprint §7.1. The global filter (`http-exception.filter.ts`) renders both consistently.
 */
export class AppException extends HttpException {
  readonly code: string;

  constructor(code: string, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
    this.code = code;
  }
}

// A small, shared vocabulary. Modules may throw their own AppException with a more specific
// code; these cover cases common to every module.
export const CommonErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  IDEMPOTENCY_KEY_REQUIRED: 'IDEMPOTENCY_KEY_REQUIRED',
  IDEMPOTENT_REQUEST_IN_PROGRESS: 'IDEMPOTENT_REQUEST_IN_PROGRESS',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const;

export class NotFoundAppException extends AppException {
  constructor(resource: string) {
    super(CommonErrorCodes.NOT_FOUND, `${resource} was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class NotImplementedAppException extends AppException {
  constructor(what: string) {
    super(
      CommonErrorCodes.NOT_IMPLEMENTED,
      `${what} is not implemented in this environment yet.`,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
