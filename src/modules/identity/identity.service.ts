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
export type UserAccountSummary = Omit<UserAccount, 'passwordHash'>;

export interface PatientSession {
  accessToken: string;
  expiresIn: number;
  account: UserAccountSummary;
}

function toSummary(account: UserAccount): UserAccountSummary {
  const summary: Partial<UserAccount> = { ...account };
  delete summary.passwordHash;
  return summary as UserAccountSummary;
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

  /** Idempotent: registering an already-known email returns the existing account. `phoneNumber`
   * is optional contact info only - LifeCome Live verifies by email, not SMS. */
  async register(email: string, phoneNumber?: string): Promise<UserAccountSummary> {
    const [existing] = await this.db.select().from(userAccounts).where(eq(userAccounts.email, email));
    if (existing) {
      return toSummary(existing);
    }

    const [created] = await this.db
      .insert(userAccounts)
      .values({ email, phoneNumber, status: 'pending_verification' })
      .returning();

    await this.requestOtp(created.id);
    return toSummary(created);
  }

  async requestOtp(userAccountId: string): Promise<{ expiresAt: Date }> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, userAccountId));
    if (!account) throw new NotFoundAppException('User account');

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

    await this.db.insert(otpChallenges).values({
      userAccountId,
      codeHash,
      purpose: 'email_verification',
      expiresAt,
    });

    // EmailService no-ops (and just logs) when BREVO_API_KEY/BREVO_SENDER_EMAIL aren't set - see
    // its own doc comment for why a failed/unconfigured send never blocks this request.
    await this.email.send({
      to: account.email,
      subject: 'Verify your email - LifeCome Live',
      html: otpEmailHtml({
        code,
        expiresInMinutes: OTP_TTL_MINUTES,
        heading: 'Verify your email',
        intro: 'Use the code below to verify your email address and finish signing in to LifeCome Live.',
      }),
    });

    // Never log a live OTP in production; in development this is how you retrieve it without a
    // real inbox attached (see EmailService for the equivalent behind BREVO_API_KEY).
    if (!this.config.isProduction) {
      this.logger.debug({ userAccountId, code }, 'OTP generated (development only — logged regardless of email delivery)');
    }

    return { expiresAt };
  }

  async verifyOtp(userAccountId: string, code: string): Promise<UserAccountSummary> {
    const [challenge] = await this.db
      .select()
      .from(otpChallenges)
      .where(and(eq(otpChallenges.userAccountId, userAccountId), isNull(otpChallenges.consumedAt)))
      .orderBy(desc(otpChallenges.createdAt))
      .limit(1);

    if (!challenge) {
      throw new AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
    }
    if (challenge.expiresAt < new Date()) {
      throw new AppException('OTP_EXPIRED', 'This code has expired. Request a new one.');
    }
    if (Number(challenge.attemptCount) >= MAX_ATTEMPTS) {
      throw new AppException('OTP_TOO_MANY_ATTEMPTS', 'Too many attempts. Request a new code.');
    }
    if (challenge.codeHash !== this.hashCode(code)) {
      await this.db
        .update(otpChallenges)
        .set({ attemptCount: String(Number(challenge.attemptCount) + 1) })
        .where(eq(otpChallenges.id, challenge.id));
      throw new AppException('OTP_INCORRECT', 'That code is not correct.');
    }

    await this.db.update(otpChallenges).set({ consumedAt: new Date() }).where(eq(otpChallenges.id, challenge.id));

    const [account] = await this.db
      .update(userAccounts)
      .set({ status: 'active', emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(userAccounts.id, userAccountId))
      .returning();

    return toSummary(account);
  }

  /** Sets the account's password, then signs it straight in — its own step after `verifyOtp`,
   * since sign-up verifies the email before it ever asks for a password. */
  async setPassword(userAccountId: string, password: string): Promise<PatientSession> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, userAccountId));
    if (!account) throw new NotFoundAppException('User account');
    if (!account.emailVerifiedAt) {
      throw new AppException('EMAIL_NOT_VERIFIED', 'Verify your email before setting a password.', HttpStatus.BAD_REQUEST);
    }

    const passwordHash = await hashPassword(password);
    const [updated] = await this.db
      .update(userAccounts)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(userAccounts.id, userAccountId))
      .returning();

    return this.issueSession(updated);
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

    return this.issueSession(account);
  }

  private async issueSession(account: UserAccount): Promise<PatientSession> {
    const accessToken = await this.jwt.signAsync({ sub: account.id, email: account.email });
    return { accessToken, expiresIn: TOKEN_TTL_SECONDS, account: toSummary(account) };
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(`${code}:${this.config.sessionJwtSecret}`).digest('hex');
  }
}
