import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { userAccountStatusEnum } from './enums';

/**
 * Authentication identity. Email is the account identifier and what's verified at sign-up
 * (LifeCome Live uses email OTP, not SMS - see `IdentityService`); phone number is optional
 * contact info only, collected for things like appointment reminders once that channel exists,
 * never used to sign in or verify anything. Clinical/demographic detail lives on `patients`,
 * one-to-one with this.
 */
export const userAccounts = pgTable(
  'user_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    phoneNumber: text('phone_number'),
    status: userAccountStatusEnum('status').notNull().default('pending_verification'),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    /** @deprecated Unused now that verification is by email (see `emailVerifiedAt`) - kept
     * rather than dropped so this migration is a pure addition, with nothing ambiguous for
     * drizzle-kit to ask about. Safe to actually drop in a later, standalone migration. */
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_accounts_email_idx').on(table.email),
    // Nullable columns don't collide on NULL in a Postgres unique index, so this still allows
    // any number of accounts with no phone number at all.
    uniqueIndex('user_accounts_phone_number_idx').on(table.phoneNumber),
  ],
);

/** A single-use one-time-passcode challenge for email verification or step-up auth. */
export const otpChallenges = pgTable('otp_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userAccountId: uuid('user_account_id')
    .notNull()
    .references(() => userAccounts.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  purpose: text('purpose').notNull().default('email_verification'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  attemptCount: text('attempt_count').notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
