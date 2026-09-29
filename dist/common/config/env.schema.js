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
    get envSchema () {
        return envSchema;
    },
    get validateEnv () {
        return validateEnv;
    }
});
const _zod = require("zod");
const envSchema = _zod.z.object({
    NODE_ENV: _zod.z.enum([
        'development',
        'test',
        'production'
    ]).default('development'),
    PORT: _zod.z.coerce.number().int().positive().default(3001),
    CORS_ORIGIN: _zod.z.string().default('http://localhost:3000').transform((value)=>value.split(',').map((origin)=>origin.trim())),
    LOG_LEVEL: _zod.z.enum([
        'fatal',
        'error',
        'warn',
        'info',
        'debug',
        'trace'
    ]).default('info'),
    DATABASE_URL: _zod.z.url(),
    REDIS_URL: _zod.z.url().default('redis://localhost:6379'),
    SESSION_JWT_SECRET: _zod.z.string().min(16, 'SESSION_JWT_SECRET must be at least 16 characters'),
    // Signs the operations-console staff JWT (see common/auth/) — deliberately a separate secret
    // from SESSION_JWT_SECRET, which is only ever an OTP-hashing pepper for patient sign-in.
    STAFF_JWT_SECRET: _zod.z.string().min(16, 'STAFF_JWT_SECRET must be at least 16 characters'),
    // Integration credentials are optional in every environment except production, where the
    // relevant module (payment, notifications, consultation) fails fast if it is actually used
    // without one configured — see each module's README.
    PAYSTACK_SECRET_KEY: _zod.z.string().optional(),
    FLUTTERWAVE_SECRET_KEY: _zod.z.string().optional(),
    TERMII_API_KEY: _zod.z.string().optional(),
    LIVEKIT_API_KEY: _zod.z.string().optional(),
    LIVEKIT_API_SECRET: _zod.z.string().optional(),
    LIVEKIT_URL: _zod.z.string().optional()
});
function validateEnv(config) {
    const parsed = envSchema.safeParse(config);
    if (!parsed.success) {
        const issues = parsed.error.issues.map((issue)=>`  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`Invalid environment configuration:\n${issues}`);
    }
    return parsed.data;
}

//# sourceMappingURL=env.schema.js.map