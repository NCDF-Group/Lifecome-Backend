import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * Thin, typed wrapper around @nestjs/config so the rest of the app injects `AppConfigService`
 * and gets autocomplete instead of stringly-typed `configService.get('SOME_KEY')` calls.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService<Env, true>) {}

  get isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get corsOrigins(): string[] {
    return this.config.get('CORS_ORIGIN', { infer: true });
  }

  get logLevel(): string {
    return this.config.get('LOG_LEVEL', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get redisUrl(): string {
    return this.config.get('REDIS_URL', { infer: true });
  }

  get sessionJwtSecret(): string {
    return this.config.get('SESSION_JWT_SECRET', { infer: true });
  }

  get staffJwtSecret(): string {
    return this.config.get('STAFF_JWT_SECRET', { infer: true });
  }

  get paystackSecretKey(): string | undefined {
    return this.config.get('PAYSTACK_SECRET_KEY', { infer: true });
  }
}
