import { defineConfig } from 'vitest/config';

/**
 * End-to-end tests boot the real Nest application (see test/setup.ts) and need a reachable
 * Postgres and Redis — run `docker compose up -d` first, or point DATABASE_URL / REDIS_URL
 * at existing ones.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
