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
const _smsservice = require("../../common/sms/sms.service");
const _password = require("../../common/security/password");
const _templates = require("../../common/email/templates");
const _templates1 = require("../../common/sms/templates");
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
    const registeredName = [
        account.firstName,
        account.lastName
    ].filter(Boolean).join(' ').trim() || null;
    return {
        ...summary,
        registeredName,
        fullName: registeredName
    };
}
let IdentityService = class IdentityService {
    /** Idempotent: registering an already-known email returns the existing account as-is (no OTP
   * resend, no overwrite of its name/password — use `otp/request` to resend). Otherwise creates
   * the account with its password already hashed and sends the first OTP by SMS. */ async register(firstName, lastName, email, phoneNumber, password) {
        const [existing] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        if (existing) {
            return toSummary(existing);
        }
        const passwordHash = await (0, _password.hashPassword)(password);
        const [created] = await this.db.insert(_schema.userAccounts).values({
            email,
            phoneNumber,
            firstName,
            lastName,
            passwordHash,
            status: 'pending_verification'
        }).returning();
        await this.requestOtp(created.id);
        return toSummary(created);
    }
    async requestOtp(userAccountId) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId));
        if (!account) throw new _appexception.NotFoundAppException('User account');
        if (!account.phoneNumber) {
            throw new _appexception.AppException('PHONE_NUMBER_MISSING', 'This account has no mobile number on file.', _common.HttpStatus.BAD_REQUEST);
        }
        return this.createChallenge(account, {
            purpose: 'phone_verification'
        });
    }
    /** Verifies the sign-up OTP and, since the password was already set at registration, signs the
   * patient straight in — there's no separate "create password" step after this one. */ async verifyOtp(userAccountId, code) {
        const challenge = await this.consumeChallenge(userAccountId, 'phone_verification', code);
        if (!challenge) throw new _appexception.AppException('OTP_NOT_FOUND', 'Request a new code and try again.');
        const [account] = await this.db.update(_schema.userAccounts).set({
            status: 'active',
            phoneVerifiedAt: new Date(),
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, userAccountId)).returning();
        return this.issueSession(account);
    }
    /** Never reveals whether `email` has an account — a generic success either way. */ async requestPasswordReset(email) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.email, email));
        const genericResponse = {
            expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000)
        };
        if (!account) return genericResponse;
        return this.createChallenge(account, {
            purpose: 'password_reset'
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
    /** Creates a fresh OTP for `purpose` and sends it over the channel that purpose uses: SMS for
   * sign-up (`phone_verification`), email for `password_reset` — forgot-password hasn't moved off
   * email. One method so both never drift apart in TTL/attempt behaviour. */ async createChallenge(account, options) {
        const code = String((0, _nodecrypto.randomInt)(0, 1_000_000)).padStart(6, '0');
        const codeHash = this.hashCode(code);
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
        await this.db.insert(_schema.otpChallenges).values({
            userAccountId: account.id,
            codeHash,
            purpose: options.purpose,
            expiresAt
        });
        // Both services no-op (and just log) when unconfigured — see SmsService/EmailService's own
        // doc comments for why a failed/unconfigured send never blocks this request.
        if (options.purpose === 'phone_verification') {
            await this.sms.send({
                to: account.phoneNumber,
                body: (0, _templates1.otpSmsText)({
                    code,
                    expiresInMinutes: OTP_TTL_MINUTES
                })
            });
        } else {
            await this.email.send({
                to: account.email,
                subject: 'Reset your password - LifeCome Live',
                html: (0, _templates.otpEmailHtml)({
                    code,
                    expiresInMinutes: OTP_TTL_MINUTES,
                    heading: 'Reset your password',
                    intro: 'Use the code below to reset your LifeCome Live password.'
                })
            });
        }
        // Never log a live OTP in production; in development this is how you retrieve it without a
        // real phone/inbox attached (see SmsService/EmailService for the equivalent behind their own
        // provider config).
        if (!this.config.isProduction) {
            this.logger.debug({
                userAccountId: account.id,
                purpose: options.purpose,
                code
            }, 'OTP generated (development only — logged regardless of delivery)');
        }
        return {
            expiresAt
        };
    }
    /** The latest unconsumed challenge for `purpose`, scoped by purpose so a pending
   * phone-verification code and a pending password-reset code can never be swapped for one
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
    constructor(db, config, email, sms, jwt, logger){
        this.db = db;
        this.config = config;
        this.email = email;
        this.sms = sms;
        this.jwt = jwt;
        this.logger = logger;
    }
};
IdentityService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_param(5, (0, _nestjspino.InjectPinoLogger)(IdentityService.name)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _configuration.AppConfigService === "undefined" ? Object : _configuration.AppConfigService,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService,
        typeof _smsservice.SmsService === "undefined" ? Object : _smsservice.SmsService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger
    ])
], IdentityService);

//# sourceMappingURL=identity.service.js.map