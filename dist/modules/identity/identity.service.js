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
const _jwt = require("@nestjs/jwt");
const _drizzleorm = require("drizzle-orm");
const _nestjspino = require("nestjs-pino");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _configuration = require("../../common/config/configuration");
const _appexception = require("../../common/errors/app-exception");
const _emailservice = require("../../common/email/email.service");
const _password = require("../../common/security/password");
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
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // matches IdentityModule's JwtModule signOptions.expiresIn
function toSummary(account) {
    const summary = {
        ...account
    };
    delete summary.passwordHash;
    return summary;
}
let IdentityService = class IdentityService {
    /** Idempotent: registering an already-known email returns the existing account. `phoneNumber`
   * is optional contact info only - LifeCome Live verifies by email, not SMS. */ async register(email, phoneNumber) {
        const [existing] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (existing) {
            return toSummary(existing);
        }
        const [created] = await this.db.insert(_schema.userAccounts).values({
            email,
            phoneNumber,
            status: 'pending_verification'
        }).returning();
        await this.requestOtp(created.id);
        return toSummary(created);
    }
    async requestOtp(userAccountId) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId));
        if (!account) throw new _appexception.NotFoundAppException('User account');
        return this.createChallenge(account, {
            purpose: 'email_verification',
            subject: 'Verify your email - LifeCome Live',
            heading: 'Verify your email',
            intro: 'Use the code below to verify your email address and finish signing in to LifeCome Live.'
        });
    }
    async verifyOtp(userAccountId, code) {
        const challenge = await this.consumeChallenge(userAccountId, 'email_verification', code);
        if (!challenge) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        const [account] = await this.db.update(_schema.userAccounts).set({
            status: 'active',
            emailVerifiedAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId)).returning();
        return toSummary(account);
    }
    /** Never reveals whether `email` has an account — a generic success either way. */ async requestPasswordReset(email) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        const genericResponse = {
            expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000)
        };
        if (!account) return genericResponse;
        return this.createChallenge(account, {
            purpose: 'password_reset',
            subject: 'Reset your password - LifeCome Live',
            heading: 'Reset your password',
            intro: 'Use the code below to reset your LifeCome Live password.'
        });
    }
    /** Checks a reset code without consuming it, so the mobile app can move the user to the "new
   * password" screen and still send the same code back with it (see `confirmPasswordReset`). */ async verifyPasswordResetCode(email, code) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (!account) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        const challenge = await this.findChallenge(account.id, 'password_reset');
        this.assertChallengeValid(challenge);
        if (challenge.codeHash !== this.hashCode(code)) {
            await this.recordFailedAttempt(challenge);
            throw new _appexception.AppException('OTP_INCORRECT', 'That code is not correct.');
        }
    }
    async confirmPasswordReset(email, code, newPassword) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (!account) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        const challenge = await this.consumeChallenge(account.id, 'password_reset', code);
        if (!challenge) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        const passwordHash = await (0, _password.hashPassword)(newPassword);
        await this.db.update(_schema.userAccounts).set({
            passwordHash,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, account.id));
    }
    /** Sets the account's password, then signs it straight in — its own step after `verifyOtp`,
   * since sign-up verifies the email before it ever asks for a password. */ async setPassword(userAccountId, password) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId));
        if (!account) throw new _appexception.NotFoundAppException('User account');
        if (!account.emailVerifiedAt) {
            throw new _appexception.AppException('EMAIL_NOT_VERIFIED', 'Verify your email before setting a password.', _common.HttpStatus.BAD_REQUEST);
        }
        const passwordHash = await (0, _password.hashPassword)(password);
        const [updated] = await this.db.update(_schema.userAccounts).set({
            passwordHash,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId)).returning();
        return this.issueSession(updated);
    }
    async login(email, password) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (!account || !account.passwordHash) {
            throw new _appexception.AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', _common.HttpStatus.UNAUTHORIZED);
        }
        const valid = await (0, _password.verifyPassword)(password, account.passwordHash);
        if (!valid) {
            throw new _appexception.AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', _common.HttpStatus.UNAUTHORIZED);
        }
        return this.issueSession(account);
    }
    async issueSession(account) {
        const accessToken = await this.jwt.signAsync({
            sub: account.id,
            email: account.email
        });
        return {
            accessToken,
            expiresIn: TOKEN_TTL_SECONDS,
            account: toSummary(account)
        };
    }
    /** Creates and emails a fresh OTP for `purpose`, shared by email verification and password
   * reset so the two never drift apart in TTL/attempt behaviour — only the email copy differs. */ async createChallenge(account, options) {
        const code = String((0, _nodecrypto.randomInt)(0, 1_000_000)).padStart(6, '0');
        const codeHash = this.hashCode(code);
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
        await this.db.insert(_schema.otpChallenges).values({
            userAccountId: account.id,
            codeHash,
            purpose: options.purpose,
            expiresAt
        });
        // EmailService no-ops (and just logs) when BREVO_API_KEY/BREVO_SENDER_EMAIL aren't set - see
        // its own doc comment for why a failed/unconfigured send never blocks this request.
        await this.email.send({
            to: account.email,
            subject: options.subject,
            html: (0, _templates.otpEmailHtml)({
                code,
                expiresInMinutes: OTP_TTL_MINUTES,
                heading: options.heading,
                intro: options.intro
            })
        });
        // Never log a live OTP in production; in development this is how you retrieve it without a
        // real inbox attached (see EmailService for the equivalent behind BREVO_API_KEY).
        if (!this.config.isProduction) {
            this.logger.debug({
                userAccountId: account.id,
                purpose: options.purpose,
                code
            }, 'OTP generated (development only — logged regardless of email delivery)');
        }
        return {
            expiresAt
        };
    }
    /** The latest unconsumed challenge for `purpose`, scoped by purpose so a pending
   * email-verification code and a pending password-reset code can never be swapped for one
   * another even while both exist for the same account. */ async findChallenge(userAccountId, purpose) {
        const [challenge] = await this.db.select().from(_schema.otpChallenges).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.otpChallenges.userAccountId, userAccountId), (0, _drizzleorm.eq)(_schema.otpChallenges.purpose, purpose), (0, _drizzleorm.isNull)(_schema.otpChallenges.consumedAt))).orderBy((0, _drizzleorm.desc)(_schema.otpChallenges.createdAt)).limit(1);
        return challenge;
    }
    assertChallengeValid(challenge) {
        if (!challenge) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        if (challenge.expiresAt < new Date()) {
            throw new _appexception.AppException('OTP_EXPIRED', 'This code has expired. Request a new one.');
        }
        if (Number(challenge.attemptCount) >= MAX_ATTEMPTS) {
            throw new _appexception.AppException('OTP_TOO_MANY_ATTEMPTS', 'Too many attempts. Request a new code.');
        }
    }
    async recordFailedAttempt(challenge) {
        await this.db.update(_schema.otpChallenges).set({
            attemptCount: String(Number(challenge.attemptCount) + 1)
        }).where((0, _drizzleorm.eq)(_schema.otpChallenges.id, challenge.id));
    }
    /** Validates and, on success, consumes the latest `purpose` challenge in one step. Returns
   * `undefined` if there's nothing to consume (no challenge found for that purpose/account). */ async consumeChallenge(userAccountId, purpose, code) {
        const challenge = await this.findChallenge(userAccountId, purpose);
        if (!challenge) return undefined;
        this.assertChallengeValid(challenge);
        if (challenge.codeHash !== this.hashCode(code)) {
            await this.recordFailedAttempt(challenge);
            throw new _appexception.AppException('OTP_INCORRECT', 'That code is not correct.');
        }
        await this.db.update(_schema.otpChallenges).set({
            consumedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.otpChallenges.id, challenge.id));
        return challenge;
    }
    hashCode(code) {
        return (0, _nodecrypto.createHash)('sha256').update(`${code}:${this.config.sessionJwtSecret}`).digest('hex');
    }
    constructor(db, config, email, jwt, logger){
        this.db = db;
        this.config = config;
        this.email = email;
        this.jwt = jwt;
        this.logger = logger;
    }
};
IdentityService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_param(4, (0, _nestjspino.InjectPinoLogger)(IdentityService.name)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _configuration.AppConfigService === "undefined" ? Object : _configuration.AppConfigService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger
    ])
], IdentityService);

//# sourceMappingURL=identity.service.js.map