import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { userAccountStatusEnum } from './enums';

/** Authentication identity. Clinical/demographic detail lives on `patients`, one-to-one with this. */
export const userAccounts = pgTable(
  'user_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phoneNumber: text('phone_number').notNull(),
    email: text('email'),
    status: userAccountStatusEnum('status').notNull().default('pending_verification'),
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('user_accounts_phone_number_idx').on(table.phoneNumber)],
);

/** A single-use one-time-passcode challenge for phone verification or step-up auth. */
export const otpChallenges = pgTable('otp_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userAccountId: uuid('user_account_id')
    .notNull()
    .references(() => userAccounts.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  purpose: text('purpose').notNull().default('phone_verification'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  attemptCount: text('attempt_count').notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
