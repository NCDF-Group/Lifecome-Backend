import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { userAccountStatusEnum } from './enums';

/**
 * Authentication identity. Email is the account identifier and is verified at sign-up with an
 * email OTP (see `IdentityService`). Phone number is retained as a patient contact channel. Name
 * and password are collected in the same sign-up step, ahead of
 * verification, so `passwordHash` is set from the start rather than as a later step.
 * Clinical/demographic detail still lives on `patients`, one-to-one with this.
 */
export const userAccounts = pgTable(
  'user_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    phoneNumber: text('phone_number'),
    /** Basic contact names, collected at sign-up. Not the clinical identity - that's
     * `patients.firstName`/`lastName`, collected separately once care-profile details exist. */
    firstName: text('first_name'),
    lastName: text('last_name'),
    /** Set at registration now that sign-up collects a password up front (see
     * `IdentityService.register`) - no longer a later, separate step. */
    passwordHash: text('password_hash'),
    status: userAccountStatusEnum('status').notNull().default('pending_verification'),
    /** Set when the account email is verified. */
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
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

/** A single-use one-time-passcode challenge for sign-up email verification or password reset. */
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
