import { customType, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { staffAccountStatusEnum, staffRoleEnum } from './enums';

/**
 * Operations-console identity — deliberately separate from `userAccounts` (patient-only, the
 * "one patient identity" rule in `patient.schema.ts`). Staff sign in with email + password, not
 * phone + OTP, and have no clinical/demographic profile, so a parallel table is simpler than
 * bolting a role/account-kind discriminator onto `userAccounts`. See blueprint §2.3 for the roles.
 */
export const staffAccounts = pgTable(
  'staff_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name').notNull(),
    role: staffRoleEnum('role').notNull(),
    status: staffAccountStatusEnum('status').notNull().default('active'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    /** Set when a profile photo exists (the bytes are in `staffAvatars`); doubles as a cache-buster
     * for the image URL so a new upload isn't hidden behind the old one in the browser cache. */
    avatarUpdatedAt: timestamp('avatar_updated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('staff_accounts_email_idx').on(table.email)],
);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

/**
 * Staff profile photos, kept out of `staffAccounts` so listing staff never drags image bytes along.
 * Stored in Postgres because there is no object storage wired up yet (see `documents/`); the
 * console downsizes each photo to 256px before upload, so rows stay small (tens of KB).
 */
export const staffAvatars = pgTable('staff_avatars', {
  staffAccountId: uuid('staff_account_id')
    .primaryKey()
    .references(() => staffAccounts.id, { onDelete: 'cascade' }),
  contentType: text('content_type').notNull(),
  image: bytea('image').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
