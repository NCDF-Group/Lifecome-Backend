import { createHash, randomInt } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { DRIZZLE, type Database } from '../../db/client';
import { otpChallenges, userAccounts } from '../../db/schema';
import { AppConfigService } from '../../common/config/configuration';
import { AppException } from '../../common/errors/app-exception';

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export interface UserAccountSummary {
  id: string;
  phoneNumber: string;
  status: string;
}

@Injectable()
export class IdentityService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly config: AppConfigService,
    @InjectPinoLogger(IdentityService.name) private readonly logger: PinoLogger,
  ) {}

  /** Idempotent: registering an already-known phone number returns the existing account. */
  async register(phoneNumber: string): Promise<UserAccountSummary> {
    const [existing] = await this.db.select().from(userAccounts).where(eq(userAccounts.phoneNumber, phoneNumber));
    if (existing) {
      return existing;
    }

    const [created] = await this.db
      .insert(userAccounts)
      .values({ phoneNumber, status: 'pending_verification' })
      .returning();

    await this.requestOtp(created.id);
    return created;
  }

  async requestOtp(userAccountId: string): Promise<{ expiresAt: Date }> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

    await this.db.insert(otpChallenges).values({
      userAccountId,
      codeHash,
      purpose: 'phone_verification',
      expiresAt,
    });

    // No SMS provider is configured in this scaffold (see .env.example — TERMII_API_KEY).
    // Never log a live OTP in production; in development this is how you retrieve it to test with.
    if (!this.config.isProduction) {
      this.logger.debug({ userAccountId, code }, 'OTP generated (development only — not sent via SMS)');
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
      .set({ status: 'active', phoneVerifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(userAccounts.id, userAccountId))
      .returning();

    return account;
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(`${code}:${this.config.sessionJwtSecret}`).digest('hex');
  }
}
