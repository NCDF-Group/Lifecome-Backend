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
    phoneNumber: (0, _pgcore.text)('phone_number').notNull(),
    email: (0, _pgcore.text)('email'),
    status: (0, _enums.userAccountStatusEnum)('status').notNull().default('pending_verification'),
    phoneVerifiedAt: (0, _pgcore.timestamp)('phone_verified_at', {
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
        (0, _pgcore.uniqueIndex)('user_accounts_phone_number_idx').on(table.phoneNumber)
    ]);
const otpChallenges = (0, _pgcore.pgTable)('otp_challenges', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    userAccountId: (0, _pgcore.uuid)('user_account_id').notNull().references(()=>userAccounts.id, {
        onDelete: 'cascade'
    }),
    codeHash: (0, _pgcore.text)('code_hash').notNull(),
    purpose: (0, _pgcore.text)('purpose').notNull().default('phone_verification'),
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