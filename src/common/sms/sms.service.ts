import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AppConfigService } from '../config/configuration';

export interface SendSmsInput {
  /** E.164 (e.g. +2348012345678). Callers are responsible for normalising it before this point. */
  to: string;
  body: string;
}

const HTTPSMS_ENDPOINT = 'https://api.httpsms.com/v1/messages/send';

/**
 * Sends a plain SMS via httpSMS (httpsms.com): the "provider" is a real Android phone running the
 * httpSMS app on its own SIM, not a telecom aggregator like Termii/Twilio — see the README's "SMS
 * delivery" section for why that's a deliberate, scale-limited choice (one physical phone's
 * throughput, no delivery SLA, a carrier could flag automated traffic on a personal SIM).
 *
 * Never throws: a failed or unconfigured send is logged and swallowed, the same "best effort"
 * treatment `NotificationsProcessor` gives every channel, so a flaky SMS gateway can never fail
 * the sign-up/OTP request itself.
 */
@Injectable()
export class SmsService {
  constructor(
    private readonly config: AppConfigService,
    @InjectPinoLogger(SmsService.name) private readonly logger: PinoLogger,
  ) {}

  async send(input: SendSmsInput): Promise<void> {
    const apiKey = this.config.httpsmsApiKey;
    const from = this.config.httpsmsFromNumber;

    if (!apiKey || !from) {
      // Never log the message body in production — only that a send was skipped.
      if (this.config.isProduction) {
        this.logger.warn({ to: input.to }, 'SMS not sent — HTTPSMS_API_KEY/HTTPSMS_FROM_NUMBER not configured');
      } else {
        this.logger.debug({ to: input.to, body: input.body }, 'SMS not sent (no provider configured — development only)');
      }
      return;
    }

    try {
      const response = await fetch(HTTPSMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ from, to: input.to, content: input.body }),
      });

      if (!response.ok) {
        const responseBody = await response.text().catch(() => '');
        this.logger.error({ to: input.to, status: response.status, responseBody }, 'httpSMS send failed');
      }
    } catch (error) {
      this.logger.error({ to: input.to, error }, 'httpSMS send threw');
    }
  }
}
