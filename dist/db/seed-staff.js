"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("dotenv/config");
const _postgresjs = require("drizzle-orm/postgres-js");
const _drizzleorm = require("drizzle-orm");
const _postgres = /*#__PURE__*/ _interop_require_default(require("postgres"));
const _password = require("../common/security/password");
const _schema = require("./schema");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Standalone bootstrap: `npm run db:seed:staff`. Creates the first `platform_administrator` so
 * someone can sign in and create every other staff account through the API — otherwise
 * `POST /admin/staff` is a chicken-and-egg problem (it requires a platform_administrator to call
 * it). Safe to re-run: does nothing if SEED_ADMIN_EMAIL already has an account.
 */ async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set.');
    }
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const fullName = process.env.SEED_ADMIN_NAME ?? 'Platform Administrator';
    if (!email || !password) {
        throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set (see .env.example).');
    }
    const sql = (0, _postgres.default)(databaseUrl, {
        max: 1
    });
    const db = (0, _postgresjs.drizzle)(sql, {
        schema: {
            staffAccounts: _schema.staffAccounts
        }
    });
    const [existing] = await db.select().from(_schema.staffAccounts).where((0, _drizzleorm.eq)(_schema.staffAccounts.email, email));
    if (existing) {
        console.log(`Staff account ${email} already exists — nothing to do.`);
    } else {
        const passwordHash = await (0, _password.hashPassword)(password);
        await db.insert(_schema.staffAccounts).values({
            email,
            passwordHash,
            fullName,
            role: 'platform_administrator'
        });
        console.log(`Created platform_administrator ${email}. Change its password after first sign-in.`);
    }
    await sql.end();
}
main().catch((error)=>{
    console.error('Seeding staff failed:', error);
    process.exit(1);
});

//# sourceMappingURL=seed-staff.js.map