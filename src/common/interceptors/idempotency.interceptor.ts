import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import type { Redis } from 'ioredis';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { AppException, CommonErrorCodes } from '../errors/app-exception';
import { REDIS_CLIENT } from '../../queue/redis.module';
import { IDEMPOTENT_KEY } from './idempotent.decorator';

const HEADER = 'idempotency-key';
const RESULT_TTL_SECONDS = 60 * 60 * 24; // keep a replayable result for 24h
const LOCK_TTL_SECONDS = 30; // a request should not legitimately take longer than this

/**
 * For handlers marked `@Idempotent()`: requires an `Idempotency-Key` header, and if the same
 * key is replayed, returns the first response instead of running the handler again — required
 * for payment, authorisation and booking requests (blueprint §7.1, §13).
 *
 * This is a pragmatic single-instance-Redis implementation (SET NX as a lock, overwrite with the
 * result on success, delete on failure so a genuinely failed request can be retried under the
 * same key). It is not a full distributed-transaction guarantee, but is enough to stop a
 * double-tapped "Pay" button from charging twice.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const required = this.reflector.get<boolean>(IDEMPOTENT_KEY, context.getHandler());
    if (!required) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const key = request.headers[HEADER];
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new AppException(
        CommonErrorCodes.IDEMPOTENCY_KEY_REQUIRED,
        `This request must include an '${HEADER}' header.`,
      );
    }

    const redisKey = `idempotency:${request.routeOptions?.url ?? request.url}:${key}`;

    return from(this.redis.get(redisKey)).pipe(
      switchMap((cached) => {
        if (cached === 'processing') {
          throw new AppException(
            CommonErrorCodes.IDEMPOTENT_REQUEST_IN_PROGRESS,
            'A request with this idempotency key is already being processed. Please wait and try again.',
            409,
          );
        }
        if (cached) {
          return of(JSON.parse(cached) as unknown);
        }
        return from(this.redis.set(redisKey, 'processing', 'EX', LOCK_TTL_SECONDS, 'NX')).pipe(
          switchMap(() =>
            next.handle().pipe(
              tap({
                next: (result: unknown) => {
                  void this.redis.set(redisKey, JSON.stringify(result ?? null), 'EX', RESULT_TTL_SECONDS);
                },
                error: () => {
                  void this.redis.del(redisKey);
                },
              }),
            ),
          ),
        );
      }),
    );
  }
}
