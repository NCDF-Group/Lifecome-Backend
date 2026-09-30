import 'dotenv/config';

/**
 * Standalone keep-alive pinger: `npm run keep-alive`. Hits the API's liveness endpoint on a fixed
 * interval and logs the result - nothing here is part of the Nest app itself (same reasoning as
 * `db/migrate.ts`: a plain script, no DI container needed).
 *
 * Superseded for its original purpose (stopping Render's free plan from spinning the service down
 * after 15 minutes idle) by `common/keep-alive/self-ping.ts`, which does the same real-HTTP-request
 * trick but *from inside the deployed app itself* - it runs for as long as the service is up, with
 * no separate always-on machine required. Running this script from your own laptop only keeps the
 * service warm while your laptop is awake and this is running in a terminal, which defeats the
 * purpose the moment you close the lid.
 *
 * Still useful as a manual, watch-the-output diagnostic (e.g. "is the deployed API actually
 * responding right now") - just not as the thing keeping it awake anymore.
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
