import 'dotenv/config';

/**
 * Standalone keep-alive pinger: `npm run keep-alive`. Hits the API's liveness endpoint on a fixed
 * interval and logs the result - nothing here is part of the Nest app itself (same reasoning as
 * `db/migrate.ts`: a plain script, no DI container needed).
 *
 * The usual reason to run this is Render's free web service plan, which spins down after 15
 * minutes with no incoming request - a periodic ping is a real request and keeps it warm. For that
 * purpose, this needs to run somewhere that's itself always on (your own machine won't help once
 * it's asleep or off); a free external uptime pinger (e.g. UptimeRobot, cron-job.org) or a small
 * always-on box calling `PING_URL` will do the same job, usually at a much longer interval - every
 * 10 seconds is far more often than the 15-minute window needs, and adds load/log volume for no
 * extra benefit. This script uses 10s only because that's what was asked for; override with
 * PING_INTERVAL_MS if you want something gentler.
 */
const PING_URL = process.env.PING_URL ?? `http://localhost:${process.env.PORT ?? 3001}/api/v1/health/live`;
const INTERVAL_MS = Number(process.env.PING_INTERVAL_MS ?? 10_000);
const TIMEOUT_MS = 8_000;

async function ping(): Promise<void> {
  const startedAt = Date.now();
  try {
    const response = await fetch(PING_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const elapsedMs = Date.now() - startedAt;
    const label = response.ok ? 'ok' : `FAILED (${response.status})`;
    console.log(`[${new Date().toISOString()}] ${label} — ${elapsedMs}ms — ${PING_URL}`);
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${new Date().toISOString()}] ERROR — ${elapsedMs}ms — ${PING_URL} — ${message}`);
  }
}

function main(): void {
  console.log(`Pinging ${PING_URL} every ${INTERVAL_MS}ms. Press Ctrl+C to stop.`);
  void ping();
  const interval = setInterval(() => void ping(), INTERVAL_MS);

  const stop = () => {
    clearInterval(interval);
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main();
