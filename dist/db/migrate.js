"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("dotenv/config");
const _postgresjs = require("drizzle-orm/postgres-js");
const _migrator = require("drizzle-orm/postgres-js/migrator");
const _postgres = /*#__PURE__*/ _interop_require_default(require("postgres"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/**
 * Standalone migration runner: `npm run db:migrate`. Kept separate from the Nest app so CI/CD
 * can run it as its own step before the app deploys, and so it never needs the full DI container.
 */ async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set.');
    }
    const sql = (0, _postgres.default)(databaseUrl, {
        max: 1
    });
    const db = (0, _postgresjs.drizzle)(sql);
    console.log('Applying migrations from ./drizzle ...');
    await (0, _migrator.migrate)(db, {
        migrationsFolder: './drizzle'
    });
    console.log('Migrations applied.');
    await sql.end();
}
main().catch((error)=>{
    console.error('Migration failed:', error);
    process.exit(1);
});

//# sourceMappingURL=migrate.js.map