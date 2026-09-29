import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { PinoLogger } from 'nestjs-pino';

import { AppException, CommonErrorCodes } from '../errors/app-exception';
import { ZodValidationException } from '../validation/zod-validation.exception';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
  correlationId: string;
}

/**
 * Renders every thrown error, whatever its origin (our own `AppException`, a Zod validation
 * failure, or something unexpected), as the same `{ error: { code, message }, correlationId }`
 * shape, and logs it with the request's correlation id attached (blueprint §7.1).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const correlationId = request.id;

    const { status, body } = this.resolve(exception, correlationId);

    if (status >= 500) {
      this.logger.error({ err: exception, correlationId }, 'Unhandled exception');
    } else {
      this.logger.warn({ correlationId, code: body.error.code }, 'Request failed');
    }

    void response.status(status).send(body);
  }

  private resolve(exception: unknown, correlationId: string): { status: number; body: ErrorBody } {
    if (exception instanceof ZodValidationException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: {
          error: {
            code: CommonErrorCodes.VALIDATION_FAILED,
            message: 'Some fields are missing or invalid.',
            details: exception.getZodError().issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
          correlationId,
        },
      };
    }

    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        body: { error: { code: exception.code, message: exception.message }, correlationId },
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message = typeof payload === 'string' ? payload : ((payload as { message?: string }).message ?? exception.message);
      return {
        status,
        body: { error: { code: HttpStatus[status] ?? 'HTTP_ERROR', message }, correlationId },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side. Please try again.' },
        correlationId,
      },
    };
  }
}
