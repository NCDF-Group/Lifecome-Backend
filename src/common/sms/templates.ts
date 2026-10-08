/** The one-time code text sent at sign-up — kept short since SMS has no formatting and a long
 * message can be split into multiple segments by the carrier. */
export function otpSmsText(params: { code: string; expiresInMinutes: number }): string {
  return `Your LifeCome Live verification code is ${params.code}. It expires in ${params.expiresInMinutes} minutes. Never share this code.`;
}
