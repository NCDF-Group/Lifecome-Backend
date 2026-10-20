import { createHash, randomInt } from 'node:crypto';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { DRIZZLE, type Database } from '../../db/client';
import { otpChallenges, userAccounts } from '../../db/schema';
import { AppConfigService } from '../../common/config/configuration';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { EmailService } from '../../common/email/email.service';
import { hashPassword, verifyPassword } from '../../common/security/password';
import { otpEmailHtml } from '../../common/email/templates';

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // matches IdentityModule's JwtModule signOptions.expiresIn

type UserAccount = typeof userAccounts.$inferSelect;
export type UserAccountSummary = Omit<UserAccount, 'passwordHash'> & {
  registeredName?: string | null;
  fullName?: string | null;
};

type OtpChallenge = typeof otpChallenges.$inferSelect;
/** Both patient sign-up verification and password reset use email OTPs. */
type OtpPurpose = 'email_verification' | 'password_reset';

export interface PatientSession {
  accessToken: string;
  expiresIn: number;
  account: UserAccountSummary;
}

function toSummary(account: UserAccount): UserAccountSummary {
  const summary: Partial<UserAccount> = { ...account };
  delete summary.passwordHash;
  const registeredName = [account.firstName, account.lastName].filter(Boolean).join(' ').trim() || null;
  return {
    ...summary,
    registeredName,
    fullName: registeredName,
  } as UserAccountSummary;
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly config: AppConfigService,
    private readonly email: EmailService,
    private readonly jwt: JwtService,
    @InjectPinoLogger(IdentityService.name) private readonly logger: PinoLogger,
  ) {}

  /** Idempotent: a known active email is returned as-is; a pending account gets a fresh email
   * verification code. Otherwise creates the account with a hashed password and sends the first
   * code to its email address. */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
  ): Promise<UserAccountSummary> {
    const [existing] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    if (existing) {
      if (existing.status === 'pending_verification') {
        await this.requestOtp(existing.id);
      }
      return toSummary(existing);
    }

    const passwordHash = await hashPassword(password);
    const [created] = await this.db
      .insert(userAccounts)
      .values({ email, phoneNumber, firstName, lastName, passwordHash, status: 'pending_verification' })
      .returning();

    await this.requestOtp(created.id);
    return toSummary(created);
  }

  async requestOtp(userAccountId: string): Promise<{ expiresAt: Date }> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, userAccountId));
    if (!account) throw new NotFoundAppException('User account');

    return this.createChallenge(account, { purpose: 'email_verification' });
  }

  /** Verifies the sign-up email OTP and signs the patient straight in. */
  async verifyOtp(userAccountId: string, code: string): Promise<PatientSession> {
    const challenge = await this.consumeChallenge(userAccountId, 'email_verification', code);
    if (!challenge) throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');

    const [account] = await this.db
      .update(userAccounts)
      .set({ status: 'active', emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(userAccounts.id, userAccountId))
      .returning();

    return this.issueSession(account);
  }

  /** Never reveals whether `email` has an account — a generic success either way. */
  async requestPasswordReset(email: string): Promise<{ expiresAt: Date }> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    const genericResponse = { expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000) };
    if (!account) return genericResponse;

    return this.createChallenge(account, { purpose: 'password_reset' });
  }

  /** Checks a reset code without consuming it, so the mobile app can move the user to the "new
   * password" screen and still send the same code back with it (see `confirmPasswordReset`). */
  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    if (!account) throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');

    const challenge = await this.findChallenge(account.id, 'password_reset');
    this.assertChallengeValid(challenge);
    if (challenge.codeHash !== this.hashCode(code)) {
      await this.recordFailedAttempt(challenge);
      throw new AppException('OTP_INCORRECT', 'That code is not correct.');
    }
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    if (!account) throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');

    const challenge = await this.consumeChallenge(account.id, 'password_reset', code);
    if (!challenge) throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');

    const passwordHash = await hashPassword(newPassword);
    await this.db.update(userAccounts).set({ passwordHash, updatedAt: new Date() }).where(eq(userAccounts.id, account.id));
  }

  async login(email: string, password: string): Promise<PatientSession> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    if (!account || !account.passwordHash) {
      throw new AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', HttpStatus.UNAUTHORIZED);
    }

    const valid = await verifyPassword(password, account.passwordHash);
    if (!valid) {
      throw new AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', HttpStatus.UNAUTHORIZED);
    }

    if (account.status === 'pending_verification') {
      throw new AppException(
        'EMAIL_NOT_VERIFIED',
        'Verify the code sent to your email before signing in.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (account.status !== 'active') {
      throw new AppException('ACCOUNT_NOT_ACTIVE', 'This account is not available for sign-in.', HttpStatus.FORBIDDEN);
    }

    return this.issueSession(account);
  }

  private async issueSession(account: UserAccount): Promise<PatientSession> {
    const accessToken = await this.jwt.signAsync({ sub: account.id, email: account.email });
    return { accessToken, expiresIn: TOKEN_TTL_SECONDS, account: toSummary(account) };
  }

  /** Creates a fresh OTP for `purpose` and sends it by email. One method keeps both flows aligned
   * on TTL and attempt behaviour. */
  private async createChallenge(
    account: UserAccount,
    options: { purpose: OtpPurpose },
  ): Promise<{ expiresAt: Date }> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

    await this.db.insert(otpChallenges).values({
      userAccountId: account.id,
      codeHash,
      purpose: options.purpose,
      expiresAt,
    });

    const isVerification = options.purpose === 'email_verification';
    await this.email.send({
      to: account.email,
      subject: isVerification ? 'Verify your email - LifeCome Live' : 'Reset your password - LifeCome Live',
      html: otpEmailHtml({
        code,
        expiresInMinutes: OTP_TTL_MINUTES,
        heading: isVerification ? 'Verify your email' : 'Reset your password',
        intro: isVerification
          ? 'Use the code below to verify your LifeCome Live email address.'
          : 'Use the code below to reset your LifeCome Live password.',
      }),
    });

    // Never log a live OTP in production; in development this is how you retrieve it without a
    // inbox attached (see EmailService's provider configuration).
    if (!this.config.isProduction) {
      this.logger.debug(
        { userAccountId: account.id, purpose: options.purpose, code },
        'OTP generated (development only — logged regardless of delivery)',
      );
    }

    return { expiresAt };
  }

  /** The latest unconsumed challenge for `purpose`, scoped by purpose so a pending
   * email-verification code and a pending password-reset code can never be swapped for one
   * another even while both exist for the same account. */
  private async findChallenge(userAccountId: string, purpose: OtpPurpose) {
    const [challenge] = await this.db
      .select()
      .from(otpChallenges)
      .where(
        and(
          eq(otpChallenges.userAccountId, userAccountId),
          eq(otpChallenges.purpose, purpose),
          isNull(otpChallenges.consumedAt),
        ),
      )
      .orderBy(desc(otpChallenges.createdAt))
      .limit(1);
    return challenge;
  }

  private assertChallengeValid(challenge: OtpChallenge | undefined): asserts challenge is OtpChallenge {
    if (!challenge) throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
    if (challenge.expiresAt < new Date()) {
      throw new AppException('OTP_EXPIRED', 'This code has expired. Request a new one.');
    }
    if (Number(challenge.attemptCount) >= MAX_ATTEMPTS) {
      throw new AppException('OTP_TOO_MANY_ATTEMPTS', 'Too many attempts. Request a new code.');
    }
  }

  private async recordFailedAttempt(challenge: OtpChallenge): Promise<void> {
    await this.db
      .update(otpChallenges)
      .set({ attemptCount: String(Number(challenge.attemptCount) + 1) })
      .where(eq(otpChallenges.id, challenge.id));
  }

  /** Validates and, on success, consumes the latest `purpose` challenge in one step. Returns
   * `undefined` if there's nothing to consume (no challenge found for that purpose/account). */
  private async consumeChallenge(
    userAccountId: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<OtpChallenge | undefined> {
    const challenge = await this.findChallenge(userAccountId, purpose);
    if (!challenge) return undefined;

    this.assertChallengeValid(challenge);
    if (challenge.codeHash !== this.hashCode(code)) {
      await this.recordFailedAttempt(challenge);
      throw new AppException('OTP_INCORRECT', 'That code is not correct.');
    }

    await this.db.update(otpChallenges).set({ consumedAt: new Date() }).where(eq(otpChallenges.id, challenge.id));
    return challenge;
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(`${code}:${this.config.sessionJwtSecret}`).digest('hex');
  }
}
