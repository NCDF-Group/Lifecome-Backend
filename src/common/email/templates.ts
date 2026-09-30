/**
 * Shared HTML shell every outgoing email renders through, so LifeCome Live's emails look like
 * one product instead of each call site inventing its own inline markup (see git history for what
 * came before this - bare, unstyled `<p>` tags). Table-based layout with inline styles throughout:
 * email clients (Outlook especially) strip `<style>` blocks and don't reliably support modern CSS,
 * so this is the one layout approach that renders consistently everywhere.
 */

const BRAND = {
  ink: '#0B2540',
  inkMuted: '#435A70',
  surface: '#F4F9FC',
  line: '#D8E4EE',
  blue: '#0667B8',
  green: '#45AF03',
  white: '#FFFFFF',
} as const;

export interface EmailLayoutOptions {
  /** Shown as the message preview in an inbox list (Gmail, Apple Mail) before the email is
   * opened - invisible in the email body itself. */
  previewText?: string;
  heading: string;
  /** Trusted HTML for the message body - callers are responsible for escaping any value that
   * came from a user (see `escapeHtml` below). */
  bodyHtml: string;
  footerNote?: string;
}

export function renderEmailLayout({ previewText, heading, bodyHtml, footerNote }: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LifeCome Live</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.surface}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    ${previewText ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.surface}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:${BRAND.white}; border-radius:16px; border:1px solid ${BRAND.line};">
            <tr>
              <td style="padding: 28px 32px 0 32px;">
                <span style="font-size:20px; font-weight:800; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <span style="color:${BRAND.green};">Life</span><span style="color:${BRAND.blue};">Come Live</span>
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 8px 32px;">
                <h1 style="margin:0; font-size:22px; line-height:1.3; color:${BRAND.ink}; font-weight:800;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 32px 28px 32px; font-size:15px; line-height:1.6; color:${BRAND.inkMuted};">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 32px; background-color:${BRAND.surface}; border-top:1px solid ${BRAND.line}; border-radius: 0 0 16px 16px;">
                <p style="margin:0; font-size:12px; line-height:1.5; color:${BRAND.inkMuted};">
                  ${footerNote ?? "You're receiving this email because it's linked to a LifeCome Live account."}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin: 20px 0 0 0; font-size:12px; color:${BRAND.inkMuted}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            LifeCome Live &middot; Quality healthcare, anytime, anywhere.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Minimal escaping for any user-supplied value interpolated into a template's `bodyHtml` -
 * cheap insurance against a stray `<` breaking the markup or rendering as a tag in the
 * recipient's mail client. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The one-time code email for both email verification and password reset - the only difference
 * between the two is `heading`/`intro`, so callers pass those rather than this having two near-
 * identical copies. */
export function otpEmailHtml(params: {
  code: string;
  expiresInMinutes: number;
  heading: string;
  intro: string;
}): string {
  const spacedCode = params.code.split('').join(' ');
  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hi there,</p>
    <p style="margin:0 0 20px 0;">${params.intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 4px 0 20px 0;">
          <span style="display:inline-block; padding: 14px 20px; background-color:${BRAND.surface}; border:1px solid ${BRAND.line}; border-radius:12px; font-size:28px; font-weight:800; letter-spacing:6px; color:${BRAND.ink}; font-family: 'SF Mono', 'Courier New', monospace;">
            ${spacedCode}
          </span>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 4px 0;">This code expires in <strong style="color:${BRAND.ink};">${params.expiresInMinutes} minutes</strong>.</p>
    <p style="margin:0;">Didn't request this? You can safely ignore this email - your account is still secure.</p>
  `;

  return renderEmailLayout({
    previewText: `Your LifeCome Live verification code is ${params.code}`,
    heading: params.heading,
    bodyHtml,
  });
}
