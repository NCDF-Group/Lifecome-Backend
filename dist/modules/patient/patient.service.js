"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PatientService", {
    enumerable: true,
    get: function() {
        return PatientService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _avatardto = require("../../common/dto/avatar.dto");
const _appexception = require("../../common/errors/app-exception");
const _imagetype = require("../../common/images/image-type");
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
let PatientService = class PatientService {
    async createProfile(input) {
        const [created] = await this.db.insert(_schema.patients).values(input).returning();
        return created;
    }
    async getById(id) {
        const [found] = await this.db.select().from(_schema.patients).where((0, _drizzleorm.eq)(_schema.patients.id, id));
        if (!found) throw new _appexception.NotFoundAppException('Patient');
        return found;
    }
    /** `/admin/patients` — every patient with its account's contact details, searchable by name/email/phone. */ async adminList(query) {
        const conditions = [];
        if (query.search) {
            const term = `%${query.search}%`;
            conditions.push((0, _drizzleorm.or)((0, _drizzleorm.ilike)(_schema.patients.firstName, term), (0, _drizzleorm.ilike)(_schema.patients.lastName, term), (0, _drizzleorm.ilike)(_schema.userAccounts.email, term), (0, _drizzleorm.ilike)(_schema.userAccounts.phoneNumber, term)));
        }
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.patients),
            phoneNumber: _schema.userAccounts.phoneNumber,
            email: _schema.userAccounts.email,
            accountStatus: _schema.userAccounts.status
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.patients.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    /** `/admin/patients/:id` — the joined row a list row links to, not the bare `getById()`. */ async adminGetById(id) {
        const [found] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.patients),
            phoneNumber: _schema.userAccounts.phoneNumber,
            email: _schema.userAccounts.email,
            accountStatus: _schema.userAccounts.status
        }).from(_schema.patients).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where((0, _drizzleorm.eq)(_schema.patients.id, id));
        if (!found) throw new _appexception.NotFoundAppException('Patient');
        return found;
    }
    async getByUserAccountId(userAccountId) {
        const [found] = await this.db.select().from(_schema.patients).where((0, _drizzleorm.eq)(_schema.patients.userAccountId, userAccountId));
        return found;
    }
    async update(id, input) {
        await this.getById(id); // 404s early if missing
        const [updated] = await this.db.update(_schema.patients).set({
            ...input,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.patients.id, id)).returning();
        return updated;
    }
    // ---- The signed-in patient's own data (`/me`) ----------------------------------------------
    async getMe(accountId) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, accountId));
        if (!account) throw new _appexception.NotFoundAppException('Account');
        const profile = await this.getByUserAccountId(accountId) ?? null;
        return {
            account: {
                id: account.id,
                email: account.email,
                phoneNumber: account.phoneNumber,
                status: account.status
            },
            profile,
            displayName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : null
        };
    }
    /** The patient row for a signed-in account, or a 409 telling the app to finish the profile first. */ async requireProfile(accountId) {
        const profile = await this.getByUserAccountId(accountId);
        if (!profile) {
            throw new _appexception.AppException('PROFILE_REQUIRED', 'Finish setting up your profile first.', _common.HttpStatus.CONFLICT);
        }
        return profile;
    }
    /** Creates the profile on first call, updates it afterwards - idempotent for the app's sign-up step. */ async upsertMyProfile(accountId, input) {
        const existing = await this.getByUserAccountId(accountId);
        if (existing) {
            const [updated] = await this.db.update(_schema.patients).set({
                ...input,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.patients.id, existing.id)).returning();
            return updated;
        }
        const [created] = await this.db.insert(_schema.patients).values({
            ...input,
            userAccountId: accountId
        }).returning();
        return created;
    }
    async patchMyProfile(accountId, input) {
        const existing = await this.requireProfile(accountId);
        const [updated] = await this.db.update(_schema.patients).set({
            ...input,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.patients.id, existing.id)).returning();
        return updated;
    }
    async setMyAvatar(accountId, input) {
        const image = Buffer.from(input.data, 'base64');
        if (image.length === 0 || image.length > _avatardto.MAX_AVATAR_BYTES) {
            throw new _appexception.AppException('AVATAR_TOO_LARGE', 'Profile photos must be under 512 KB.', _common.HttpStatus.BAD_REQUEST);
        }
        if (!(0, _imagetype.matchesImageType)(image, input.contentType)) {
            throw new _appexception.AppException('AVATAR_INVALID_IMAGE', 'That file is not a valid JPEG, PNG or WebP image.', _common.HttpStatus.BAD_REQUEST);
        }
        const profile = await this.requireProfile(accountId);
        const now = new Date();
        return this.db.transaction(async (tx)=>{
            await tx.insert(_schema.patientAvatars).values({
                patientId: profile.id,
                contentType: input.contentType,
                image,
                updatedAt: now
            }).onConflictDoUpdate({
                target: _schema.patientAvatars.patientId,
                set: {
                    contentType: input.contentType,
                    image,
                    updatedAt: now
                }
            });
            const [updated] = await tx.update(_schema.patients).set({
                avatarUpdatedAt: now,
                updatedAt: now
            }).where((0, _drizzleorm.eq)(_schema.patients.id, profile.id)).returning();
            return updated;
        });
    }
    async removeMyAvatar(accountId) {
        const profile = await this.requireProfile(accountId);
        return this.db.transaction(async (tx)=>{
            await tx.delete(_schema.patientAvatars).where((0, _drizzleorm.eq)(_schema.patientAvatars.patientId, profile.id));
            const [updated] = await tx.update(_schema.patients).set({
                avatarUpdatedAt: null,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.patients.id, profile.id)).returning();
            return updated;
        });
    }
    async getMyAvatar(accountId) {
        const profile = await this.requireProfile(accountId);
        const [avatar] = await this.db.select({
            contentType: _schema.patientAvatars.contentType,
            image: _schema.patientAvatars.image
        }).from(_schema.patientAvatars).where((0, _drizzleorm.eq)(_schema.patientAvatars.patientId, profile.id));
        if (!avatar) throw new _appexception.NotFoundAppException('Profile photo');
        return avatar;
    }
    constructor(db){
        this.db = db;
    }
};
PatientService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], PatientService);

//# sourceMappingURL=patient.service.js.map