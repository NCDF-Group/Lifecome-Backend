"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IdentityService", {
    enumerable: true,
    get: function() {
        return IdentityService;
    }
});
const _nodecrypto = require("node:crypto");
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _nestjspino = require("nestjs-pino");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _configuration = require("../../common/config/configuration");
const _appexception = require("../../common/errors/app-exception");
const _emailservice = require("../../common/email/email.service");
const _templates = require("../../common/email/templates");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
let IdentityService = class IdentityService {
    /** Idempotent: registering an already-known email returns the existing account. `phoneNumber`
   * is optional contact info only - LifeCome Live verifies by email, not SMS. */ async register(email, phoneNumber) {
        const [existing] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (existing) {
            return existing;
        }
        const [created] = await this.db.insert(_schema.userAccounts).values({
            email,
            phoneNumber,
            status: 'pending_verification'
        }).returning();
        await this.requestOtp(created.id);
        return created;
    }
    async requestOtp(userAccountId) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId));
        if (!account) throw new _appexception.NotFoundAppException('User account');
        const code = String((0, _nodecrypto.randomInt)(0, 1_000_000)).padStart(6, '0');
        const codeHash = this.hashCode(code);
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
        await this.db.insert(_schema.otpChallenges).values({
            userAccountId,
            codeHash,
            purpose: 'email_verification',
            expiresAt
        });
        // EmailService no-ops (and just logs) when BREVO_API_KEY/BREVO_SENDER_EMAIL aren't set - see
        // its own doc comment for why a failed/unconfigured send never blocks this request.
        await this.email.send({
            to: account.email,
            subject: 'Verify your email - LifeCome Live',
            html: (0, _templates.otpEmailHtml)({
                code,
                expiresInMinutes: OTP_TTL_MINUTES,
                heading: 'Verify your email',
                intro: 'Use the code below to verify your email address and finish signing in to LifeCome Live.'
            })
        });
        // Never log a live OTP in production; in development this is how you retrieve it without a
        // real inbox attached (see EmailService for the equivalent behind BREVO_API_KEY).
        if (!this.config.isProduction) {
            this.logger.debug({
                userAccountId,
                code
            }, 'OTP generated (development only — logged regardless of email delivery)');
        }
        return {
            expiresAt
        };
    }
    async verifyOtp(userAccountId, code) {
        const [challenge] = await this.db.select().from(_schema.otpChallenges).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.otpChallenges.userAccountId, userAccountId), (0, _drizzleorm.isNull)(_schema.otpChallenges.consumedAt))).orderBy((0, _drizzleorm.desc)(_schema.otpChallenges.createdAt)).limit(1);
        if (!challenge) {
            throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        }
        if (challenge.expiresAt < new Date()) {
            throw new _appexception.AppException('OTP_EXPIRED', 'This code has expired. Request a new one.');
        }
        if (Number(challenge.attemptCount) >= MAX_ATTEMPTS) {
            throw new _appexception.AppException('OTP_TOO_MANY_ATTEMPTS', 'Too many attempts. Request a new code.');
        }
        if (challenge.codeHash !== this.hashCode(code)) {
            await this.db.update(_schema.otpChallenges).set({
                attemptCount: String(Number(challenge.attemptCount) + 1)
            }).where((0, _drizzleorm.eq)(_schema.otpChallenges.id, challenge.id));
            throw new _appexception.AppException('OTP_INCORRECT', 'That code is not correct.');
        }
        await this.db.update(_schema.otpChallenges).set({
            consumedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.otpChallenges.id, challenge.id));
        const [account] = await this.db.update(_schema.userAccounts).set({
            status: 'active',
            emailVerifiedAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId)).returning();
        return account;
    }
    hashCode(code) {
        return (0, _nodecrypto.createHash)('sha256').update(`${code}:${this.config.sessionJwtSecret}`).digest('hex');
    }
    constructor(db, config, email, logger){
        this.db = db;
        this.config = config;
        this.email = email;
        this.logger = logger;
    }
};
IdentityService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_param(3, (0, _nestjspino.InjectPinoLogger)(IdentityService.name)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _configuration.AppConfigService === "undefined" ? Object : _configuration.AppConfigService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger
    ])
], IdentityService);

//# sourceMappingURL=identity.service.js.map