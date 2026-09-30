"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get otpChallenges () {
        return otpChallenges;
    },
    get userAccounts () {
        return userAccounts;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const userAccounts = (0, _pgcore.pgTable)('user_accounts', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    email: (0, _pgcore.text)('email').notNull(),
    phoneNumber: (0, _pgcore.text)('phone_number'),
    /** Null until `IdentityService.setPassword` - the account exists (and its email may already
     * be verified) before it necessarily has one, since sign-up verifies the email first and sets
     * a password as its own separate step (see `IdentityController`'s `POST /identity/password`). */ passwordHash: (0, _pgcore.text)('password_hash'),
    status: (0, _enums.userAccountStatusEnum)('status').notNull().default('pending_verification'),
    emailVerifiedAt: (0, _pgcore.timestamp)('email_verified_at', {
        withTimezone: true
    }),
    /** @deprecated Unused now that verification is by email (see `emailVerifiedAt`) - kept
     * rather than dropped so this migration is a pure addition, with nothing ambiguous for
     * drizzle-kit to ask about. Safe to actually drop in a later, standalone migration. */ phoneVerifiedAt: (0, _pgcore.timestamp)('phone_verified_at', {
        withTimezone: true
    }),
    mfaEnabled: (0, _pgcore.boolean)('mfa_enabled').notNull().default(false),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
}, (table)=>[
        (0, _pgcore.uniqueIndex)('user_accounts_email_idx').on(table.email),
        // Nullable columns don't collide on NULL in a Postgres unique index, so this still allows
        // any number of accounts with no phone number at all.
        (0, _pgcore.uniqueIndex)('user_accounts_phone_number_idx').on(table.phoneNumber)
    ]);
const otpChallenges = (0, _pgcore.pgTable)('otp_challenges', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    userAccountId: (0, _pgcore.uuid)('user_account_id').notNull().references(()=>userAccounts.id, {
        onDelete: 'cascade'
    }),
    codeHash: (0, _pgcore.text)('code_hash').notNull(),
    purpose: (0, _pgcore.text)('purpose').notNull().default('email_verification'),
    expiresAt: (0, _pgcore.timestamp)('expires_at', {
        withTimezone: true
    }).notNull(),
    consumedAt: (0, _pgcore.timestamp)('consumed_at', {
        withTimezone: true
    }),
    attemptCount: (0, _pgcore.text)('attempt_count').notNull().default('0'),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=identity.schema.js.map