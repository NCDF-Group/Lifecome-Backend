const INTERVAL_MS = Number(process.env.PING_INTERVAL_MS ?? 10 * 60_000); // 10 minutes

/** The one shape this needs from `PinoLogger` - kept minimal so it isn't pinned to whatever
 * custom-levels generic `PinoLogger` happens to be parameterised with at the call site. */
interface KeepAliveLogger {
  info(obj: Record<string, unknown>, message: string): void;
  warn(obj: Record<string, unknown>, message: string): void;
}

/**
 * Keeps this service itself awake on Render's free plan, which spins a web service down after 15
 * minutes with no incoming request - a periodic real HTTP round-trip to its own public URL counts
 * as one, so it never spins down. Deliberately part of the deployed app rather than a standalone
 * script (see `scripts/keep-alive.ts`, the local/manual version of this): that one only runs while
 * *your machine* is awake, which defeats the purpose the moment you close your laptop. This runs
 * for as long as the service itself is up, no separate always-on box required.
 *
 * A no-op everywhere else: `RENDER_EXTERNAL_URL` is a platform env var Render sets automatically
 * on every web service (its own public HTTPS URL) and nothing else sets, so local dev and any
 * other host just skip this entirely.
 */
export function startSelfPing(logger: KeepAliveLogger): void {
  const baseUrl = process.env.RENDER_EXTERNAL_URL;
  if (!baseUrl) return;

  const url = `${baseUrl}/api/v1/health/live`;

  async function ping(): Promise<void> {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
      if (!response.ok) {
        logger.warn({ url, status: response.status }, 'Self-ping got a non-OK response');
      }
    } catch (error) {
      logger.warn({ url, err: error }, 'Self-ping failed');
    }
  }

  setInterval(() => void ping(), INTERVAL_MS).unref();
  logger.info({ url, intervalMs: INTERVAL_MS }, 'Self-ping started (keeps the free-tier service awake)');
}
