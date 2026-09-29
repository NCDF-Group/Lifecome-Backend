"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StaffService", {
    enumerable: true,
    get: function() {
        return StaffService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _emailservice = require("../../common/email/email.service");
const _appexception = require("../../common/errors/app-exception");
const _password = require("../../common/security/password");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _staffdto = require("./dto/staff.dto");
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
function toSummary(account) {
    const summary = {
        ...account
    };
    delete summary.passwordHash;
    return summary;
}
let StaffService = class StaffService {
    async create(input) {
        const [existing] = await this.db.select().from(_schema.staffAccounts).where((0, _drizzleorm.eq)(_schema.staffAccounts.email, input.email));
        if (existing) {
            throw new _appexception.AppException('STAFF_EMAIL_TAKEN', 'A staff account with this email already exists.', _common.HttpStatus.CONFLICT);
        }
        const passwordHash = await (0, _password.hashPassword)(input.password);
        const [created] = await this.db.insert(_schema.staffAccounts).values({
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            role: input.role
        }).returning();
        // Deliberately no password in this email — whoever created the account already set it and
        // shares it with the new staff member directly. EmailService no-ops if Brevo isn't configured.
        await this.email.send({
            to: created.email,
            subject: 'Your LifeCome Live operations console account',
            html: `<p>Hi ${escapeHtml(created.fullName)},</p><p>An operations console account was created for you at LifeCome Live, with the role of <strong>${escapeHtml(created.role)}</strong>.</p><p>Sign in with this email address and the password you were given.</p>`
        });
        return toSummary(created);
    }
    async list(query) {
        const conditions = [];
        if (query.role) conditions.push((0, _drizzleorm.eq)(_schema.staffAccounts.role, query.role));
        if (query.status) conditions.push((0, _drizzleorm.eq)(_schema.staffAccounts.status, query.status));
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.staffAccounts).where(where);
        const rows = await this.db.select().from(_schema.staffAccounts).where(where).orderBy((0, _drizzleorm.desc)(_schema.staffAccounts.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(rows.map(toSummary), total, query.page, query.pageSize);
    }
    async getById(id) {
        const [account] = await this.db.select().from(_schema.staffAccounts).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id));
        if (!account) throw new _appexception.NotFoundAppException('Staff account');
        return toSummary(account);
    }
    async update(id, input) {
        await this.getById(id); // 404s early if missing
        const [updated] = await this.db.update(_schema.staffAccounts).set({
            ...input,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id)).returning();
        return toSummary(updated);
    }
    /** Self-service password change: the current password is required, so a stolen-but-unexpired
   * session token alone can't lock the real owner out. */ async changePassword(id, input) {
        const [account] = await this.db.select().from(_schema.staffAccounts).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id));
        if (!account) throw new _appexception.NotFoundAppException('Staff account');
        const valid = await (0, _password.verifyPassword)(input.currentPassword, account.passwordHash);
        if (!valid) {
            throw new _appexception.AppException('INVALID_CURRENT_PASSWORD', 'Your current password is incorrect.', _common.HttpStatus.BAD_REQUEST);
        }
        const passwordHash = await (0, _password.hashPassword)(input.newPassword);
        await this.db.update(_schema.staffAccounts).set({
            passwordHash,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id));
    }
    /** Replaces the staff member's profile photo. The bytes must really be the declared image type,
   * so a renamed file (or anything else) can't be stored and later served as an image. */ async setAvatar(id, input) {
        const image = Buffer.from(input.data, 'base64');
        if (image.length === 0 || image.length > _staffdto.MAX_AVATAR_BYTES) {
            throw new _appexception.AppException('AVATAR_TOO_LARGE', 'Profile photos must be under 512 KB.', _common.HttpStatus.BAD_REQUEST);
        }
        if (!matchesImageType(image, input.contentType)) {
            throw new _appexception.AppException('AVATAR_INVALID_IMAGE', 'That file is not a valid JPEG, PNG or WebP image.', _common.HttpStatus.BAD_REQUEST);
        }
        await this.getById(id);
        const now = new Date();
        return this.db.transaction(async (tx)=>{
            await tx.insert(_schema.staffAvatars).values({
                staffAccountId: id,
                contentType: input.contentType,
                image,
                updatedAt: now
            }).onConflictDoUpdate({
                target: _schema.staffAvatars.staffAccountId,
                set: {
                    contentType: input.contentType,
                    image,
                    updatedAt: now
                }
            });
            const [updated] = await tx.update(_schema.staffAccounts).set({
                avatarUpdatedAt: now,
                updatedAt: now
            }).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id)).returning();
            return toSummary(updated);
        });
    }
    async removeAvatar(id) {
        await this.getById(id);
        return this.db.transaction(async (tx)=>{
            await tx.delete(_schema.staffAvatars).where((0, _drizzleorm.eq)(_schema.staffAvatars.staffAccountId, id));
            const [updated] = await tx.update(_schema.staffAccounts).set({
                avatarUpdatedAt: null,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, id)).returning();
            return toSummary(updated);
        });
    }
    async getAvatar(id) {
        const [avatar] = await this.db.select({
            contentType: _schema.staffAvatars.contentType,
            image: _schema.staffAvatars.image
        }).from(_schema.staffAvatars).where((0, _drizzleorm.eq)(_schema.staffAvatars.staffAccountId, id));
        if (!avatar) throw new _appexception.NotFoundAppException('Profile photo');
        return avatar;
    }
    /** Used by `AuthService.login` only — never returns the password hash outward. */ async verifyCredentials(email, password) {
        const [account] = await this.db.select().from(_schema.staffAccounts).where((0, _drizzleorm.eq)(_schema.staffAccounts.email, email));
        if (!account || account.status !== 'active') return null;
        const valid = await (0, _password.verifyPassword)(password, account.passwordHash);
        if (!valid) return null;
        const [updated] = await this.db.update(_schema.staffAccounts).set({
            lastLoginAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.staffAccounts.id, account.id)).returning();
        return toSummary(updated);
    }
    constructor(db, email){
        this.db = db;
        this.email = email;
    }
};
StaffService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _emailservice.EmailService === "undefined" ? Object : _emailservice.EmailService
    ])
], StaffService);
/** Minimal escaping for values interpolated into the welcome email's HTML (a staff member's own
 * full name/role, not untrusted external input, but cheap insurance against a stray `<` breaking
 * the markup or rendering as a tag in the recipient's mail client). */ function escapeHtml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/** Checks the file's leading "magic" bytes against its declared type. */ function matchesImageType(image, contentType) {
    switch(contentType){
        case 'image/jpeg':
            return image.length > 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
        case 'image/png':
            return image.subarray(0, 8).equals(Buffer.from([
                0x89,
                0x50,
                0x4e,
                0x47,
                0x0d,
                0x0a,
                0x1a,
                0x0a
            ]));
        case 'image/webp':
            return image.length > 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
    }
}

//# sourceMappingURL=staff.service.js.map