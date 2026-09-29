import { Global, Inject, Injectable, Module, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import { AppConfigService } from '../common/config/configuration';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');
export const PG_CLIENT = Symbol('PG_CLIENT');

export type Database = PostgresJsDatabase<typeof schema>;

@Injectable()
class PgShutdown implements OnApplicationShutdown {
  constructor(@Inject(PG_CLIENT) private readonly sql: Sql) {}

  async onApplicationShutdown(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}

/**
 * Provides a typed Drizzle client (`DRIZZLE`) over a single postgres.js connection pool.
 * `@Global` so every module can `@Inject(DRIZZLE)` without importing this module directly.
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => postgres(config.databaseUrl, { max: 10 }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_CLIENT],
      useFactory: (sql: Sql): Database => drizzle(sql, { schema }),
    },
    PgShutdown,
  ],
  exports: [DRIZZLE, PG_CLIENT],
})
export class DrizzleModule {}
