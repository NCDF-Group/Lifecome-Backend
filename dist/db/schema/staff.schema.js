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
    get staffAccounts () {
        return staffAccounts;
    },
    get staffAvatars () {
        return staffAvatars;
    }
});
const _pgcore = require("drizzle-orm/pg-core");
const _enums = require("./enums");
const staffAccounts = (0, _pgcore.pgTable)('staff_accounts', {
    id: (0, _pgcore.uuid)('id').primaryKey().defaultRandom(),
    email: (0, _pgcore.text)('email').notNull(),
    passwordHash: (0, _pgcore.text)('password_hash').notNull(),
    fullName: (0, _pgcore.text)('full_name').notNull(),
    role: (0, _enums.staffRoleEnum)('role').notNull(),
    status: (0, _enums.staffAccountStatusEnum)('status').notNull().default('active'),
    lastLoginAt: (0, _pgcore.timestamp)('last_login_at', {
        withTimezone: true
    }),
    /** Set when a profile photo exists (the bytes are in `staffAvatars`); doubles as a cache-buster
     * for the image URL so a new upload isn't hidden behind the old one in the browser cache. */ avatarUpdatedAt: (0, _pgcore.timestamp)('avatar_updated_at', {
        withTimezone: true
    }),
    createdAt: (0, _pgcore.timestamp)('created_at', {
        withTimezone: true
    }).notNull().defaultNow(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
}, (table)=>[
        (0, _pgcore.uniqueIndex)('staff_accounts_email_idx').on(table.email)
    ]);
const bytea = (0, _pgcore.customType)({
    dataType: ()=>'bytea'
});
const staffAvatars = (0, _pgcore.pgTable)('staff_avatars', {
    staffAccountId: (0, _pgcore.uuid)('staff_account_id').primaryKey().references(()=>staffAccounts.id, {
        onDelete: 'cascade'
    }),
    contentType: (0, _pgcore.text)('content_type').notNull(),
    image: bytea('image').notNull(),
    updatedAt: (0, _pgcore.timestamp)('updated_at', {
        withTimezone: true
    }).notNull().defaultNow()
});

//# sourceMappingURL=staff.schema.js.map