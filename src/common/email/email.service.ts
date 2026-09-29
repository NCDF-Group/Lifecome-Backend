import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AppConfigService } from '../config/configuration';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Sends transactional email via Brevo (brevo.com). Never throws: a failed or unconfigured send is
 * logged and swallowed — the same "best effort" treatment `SmsService` gives SMS and
 * `NotificationsProcessor` gives every channel, so a flaky email provider can never fail whatever
 * triggered the email (e.g. creating a staff account).
 */
@Injectable()
export class EmailService {
  constructor(
    private readonly config: AppConfigService,
    @InjectPinoLogger(EmailService.name) private readonly logger: PinoLogger,
  ) {}

  async send(input: SendEmailInput): Promise<void> {
    const apiKey = this.config.brevoApiKey;
    const senderEmail = this.config.brevoSenderEmail;

    if (!apiKey || !senderEmail) {
      // Never log the HTML body in production — only that a send was skipped.
      if (this.config.isProduction) {
        this.logger.warn({ to: input.to, subject: input.subject }, 'Email not sent — BREVO_API_KEY/BREVO_SENDER_EMAIL not configured');
      } else {
        this.logger.debug({ to: input.to, subject: input.subject, html: input.html }, 'Email not sent (no provider configured — development only)');
      }
      return;
    }

    try {
      const response = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          sender: { email: senderEmail, name: 'LifeCome Live' },
          to: [{ email: input.to }],
          subject: input.subject,
          htmlContent: input.html,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text().catch(() => '');
        this.logger.error({ to: input.to, status: response.status, responseBody }, 'Brevo send failed');
      }
    } catch (error) {
      this.logger.error({ to: input.to, error }, 'Brevo send threw');
    }
  }
}
