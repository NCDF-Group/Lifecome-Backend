import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import type { Redis } from 'ioredis';

import { REDIS_CLIENT, RedisModule } from './redis.module';

export const QUEUE_NAMES = {
  NOTIFICATIONS: 'notifications',
  RECONCILIATION: 'reconciliation',
} as const;

/**
 * Registers BullMQ against the shared Redis connection and declares every queue the app uses.
 * `@Global` + re-exporting `BullModule` so any module can `@InjectQueue(QUEUE_NAMES.X)` without
 * re-importing this module everywhere.
 */
@Global()
@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      imports: [RedisModule],
      inject: [REDIS_CLIENT],
      useFactory: (connection: Redis) => ({ connection }),
    }),
    BullModule.registerQueue({ name: QUEUE_NAMES.NOTIFICATIONS }, { name: QUEUE_NAMES.RECONCILIATION }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
