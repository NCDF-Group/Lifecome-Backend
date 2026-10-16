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
function parseName(input) {
    let firstName = (input.firstName || '').trim();
    let lastName = (input.lastName || '').trim();
    if (input.fullName && input.fullName.trim()) {
        const parts = input.fullName.trim().split(/\s+/).filter(Boolean);
        if (!firstName && parts.length > 0) {
            firstName = parts[0];
        }
        if (!lastName && parts.length > 1) {
            lastName = parts.slice(1).join(' ');
        }
    }
    if (!lastName && firstName.includes(' ')) {
        const parts = firstName.split(/\s+/).filter(Boolean);
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
    }
    return {
        firstName: firstName || 'Patient',
        lastName: lastName || ''
    };
}
let PatientService = class PatientService {
    async createProfile(input) {
        const { fullName, ...rest } = input;
        const names = parseName({
            fullName,
            firstName: input.firstName,
            lastName: input.lastName
        });
        const payload = {
            ...rest,
            firstName: names.firstName,
            lastName: names.lastName
        };
        const [created] = await this.db.insert(_schema.patients).values(payload).returning();
        return created;
    }
    async getById(id) {
        const [found] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.patients),
            registeredFirstName: _schema.userAccounts.firstName,
            registeredLastName: _schema.userAccounts.lastName,
            email: _schema.userAccounts.email,
            phoneNumber: _schema.userAccounts.phoneNumber
        }).from(_schema.patients).leftJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.patients.userAccountId, _schema.userAccounts.id)).where((0, _drizzleorm.or)((0, _drizzleorm.eq)(_schema.patients.id, id), (0, _drizzleorm.eq)(_schema.patients.userAccountId, id)));
        if (!found) throw new _appexception.NotFoundAppException('Patient');
        const registeredName = [
            found.registeredFirstName,
            found.registeredLastName
        ].filter(Boolean).join(' ').trim() || undefined;
        return {
            ...found,
            registeredName
        };
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
        const existing = await this.getById(id); // 404s early if missing
        const { fullName, ...rest } = input;
        const updatePayload = {
            ...rest
        };
        if (fullName !== undefined || input.firstName !== undefined || input.lastName !== undefined) {
            const names = parseName({
                fullName,
                firstName: input.firstName ?? existing.firstName,
                lastName: input.lastName ?? existing.lastName
            });
            updatePayload.firstName = names.firstName;
            updatePayload.lastName = names.lastName;
        }
        const [updated] = await this.db.update(_schema.patients).set({
            ...updatePayload,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.patients.id, id)).returning();
        return updated;
    }
    // ---- The signed-in patient's own data (`/me`) ----------------------------------------------
    async getMe(accountId) {
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, accountId));
        if (!account) throw new _appexception.NotFoundAppException('Account');
        const profile = await this.getByUserAccountId(accountId) ?? null;
        const accountFullName = [
            account.firstName,
            account.lastName
        ].filter(Boolean).join(' ').trim();
        const profileFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
        const fullName = profileFullName || accountFullName || null;
        const nameParts = (fullName || '').trim().split(/\s+/).filter(Boolean);
        const secondName = nameParts.length >= 2 ? nameParts[1] : nameParts[0] || null;
        return {
            account: {
                id: account.id,
                email: account.email,
                phoneNumber: account.phoneNumber,
                firstName: account.firstName,
                lastName: account.lastName,
                registeredName: accountFullName || null,
                status: account.status
            },
            profile,
            displayName: fullName,
            fullName,
            secondName
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
        const { fullName, ...rest } = input;
        const names = parseName({
            fullName,
            firstName: input.firstName,
            lastName: input.lastName
        });
        const payload = {
            ...rest,
            firstName: names.firstName,
            lastName: names.lastName
        };
        // Keep userAccounts in sync with profile name
        await this.db.update(_schema.userAccounts).set({
            firstName: names.firstName,
            lastName: names.lastName
        }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, accountId));
        const existing = await this.getByUserAccountId(accountId);
        if (existing) {
            const [updated] = await this.db.update(_schema.patients).set({
                ...payload,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.patients.id, existing.id)).returning();
            return updated;
        }
        const [created] = await this.db.insert(_schema.patients).values({
            ...payload,
            userAccountId: accountId
        }).returning();
        return created;
    }
    async patchMyProfile(accountId, input) {
        const existing = await this.requireProfile(accountId);
        const { fullName, ...rest } = input;
        const updatePayload = {
            ...rest
        };
        if (fullName !== undefined || input.firstName !== undefined || input.lastName !== undefined) {
            const names = parseName({
                fullName,
                firstName: input.firstName ?? existing.firstName,
                lastName: input.lastName ?? existing.lastName
            });
            updatePayload.firstName = names.firstName;
            updatePayload.lastName = names.lastName;
            await this.db.update(_schema.userAccounts).set({
                firstName: names.firstName,
                lastName: names.lastName
            }).where((0, _drizzleorm.eq)(_schema.userAccounts.id, accountId));
        }
        const [updated] = await this.db.update(_schema.patients).set({
            ...updatePayload,
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
    // ---- Dependants --------------------------------------------------------------------------
    async listDependants(accountId) {
        const profile = await this.requireProfile(accountId);
        return this.db.select().from(_schema.patientDependants).where((0, _drizzleorm.eq)(_schema.patientDependants.patientId, profile.id)).orderBy((0, _drizzleorm.desc)(_schema.patientDependants.createdAt));
    }
    async createDependant(accountId, input) {
        const profile = await this.requireProfile(accountId);
        const [created] = await this.db.insert(_schema.patientDependants).values({
            patientId: profile.id,
            firstName: input.firstName,
            lastName: input.lastName,
            relationship: input.relationship,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            bloodGroup: input.bloodGroup,
            genotype: input.genotype,
            status: input.status ?? 'Covered'
        }).returning();
        return created;
    }
    async updateDependant(accountId, dependantId, input) {
        const profile = await this.requireProfile(accountId);
        const [found] = await this.db.select().from(_schema.patientDependants).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.patientDependants.id, dependantId), (0, _drizzleorm.eq)(_schema.patientDependants.patientId, profile.id)));
        if (!found) throw new _appexception.NotFoundAppException('Dependant');
        const [updated] = await this.db.update(_schema.patientDependants).set({
            ...input,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.patientDependants.id, dependantId)).returning();
        return updated;
    }
    async deleteDependant(accountId, dependantId) {
        const profile = await this.requireProfile(accountId);
        const [found] = await this.db.select().from(_schema.patientDependants).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.patientDependants.id, dependantId), (0, _drizzleorm.eq)(_schema.patientDependants.patientId, profile.id)));
        if (!found) throw new _appexception.NotFoundAppException('Dependant');
        await this.db.delete(_schema.patientDependants).where((0, _drizzleorm.eq)(_schema.patientDependants.id, dependantId));
    }
    // ---- Patient Dashboard -------------------------------------------------------------------
    async getDashboard(accountId) {
        const profile = await this.getByUserAccountId(accountId);
        const [account] = await this.db.select().from(_schema.userAccounts).where((0, _drizzleorm.eq)(_schema.userAccounts.id, accountId));
        if (!account) throw new _appexception.NotFoundAppException('Account');
        const accountFullName = [
            account.firstName,
            account.lastName
        ].filter(Boolean).join(' ').trim();
        const profileFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
        const fullName = profileFullName || accountFullName || null;
        const nameParts = (fullName || '').trim().split(/\s+/).filter(Boolean);
        const secondName = nameParts.length >= 2 ? nameParts[1] : nameParts[0] || null;
        const now = new Date();
        const currentHour = now.getHours();
        const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
        const greeting = secondName ? `${timeGreeting}, ${secondName}` : timeGreeting;
        const fourServices = [
            {
                id: 'gp',
                title: 'GP',
                subtitle: 'Online, clinic & menopause care',
                destination: '/gp',
                icon: 'stethoscope',
                action: 'Book a GP appointment'
            },
            {
                id: 'care',
                title: 'Care',
                subtitle: 'Professional care & support',
                destination: '/care',
                icon: 'hand-heart',
                action: 'Request a care assessment'
            },
            {
                id: 'wellbeing',
                title: 'Wellbeing',
                subtitle: 'Coaching, sessions & shop',
                destination: '/wellbeing',
                icon: 'leaf',
                action: 'Explore sessions or shop'
            },
            {
                id: 'insurance',
                title: 'Insurance',
                subtitle: 'Explore cover & manage policies',
                destination: '/insurance',
                icon: 'shield-check',
                action: 'Explore cover or view policies'
            }
        ];
        const quickLinks = {
            bookGp: {
                label: 'Book a GP appointment',
                route: '/gp/book'
            },
            visits: {
                label: 'Visits — Appointments & care visits',
                route: '/me/visits'
            },
            healthRecords: {
                label: 'Health records — Your records & care plans',
                route: '/records'
            },
            membership: {
                label: 'Membership & benefits — View your access and funding',
                route: '/membership'
            },
            urgentHelp: {
                label: 'Need urgent help? View emergency guidance.',
                route: '/services/emergency-guidance'
            }
        };
        if (!profile) {
            return {
                account: {
                    id: account.id,
                    email: account.email,
                    phoneNumber: account.phoneNumber,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    registeredName: accountFullName || null,
                    status: account.status
                },
                profile: null,
                displayName: fullName,
                fullName,
                secondName,
                greeting,
                heading: 'How can we help today?',
                fourServices,
                quickLinks,
                upcomingAppointment: null,
                activeCarePlan: null,
                recentVisits: [],
                hmoCoverage: null,
                unreadNotificationsCount: 0,
                stats: {
                    totalAppointments: 0,
                    activePrescriptionsCount: 0,
                    linkedPayersCount: 0,
                    dependantsCount: 0,
                    careArrangementsCount: 0,
                    linkedInsurancePoliciesCount: 0,
                    shopOrdersCount: 0
                }
            };
        }
        // 1. Upcoming appointment
        const [upcoming] = await this.db.select({
            id: _schema.appointments.id,
            status: _schema.appointments.status,
            consultationMode: _schema.appointments.consultationMode,
            locationCity: _schema.appointments.locationCity,
            clinicName: _schema.appointments.clinicName,
            clinicAddress: _schema.appointments.clinicAddress,
            arrivalInstructions: _schema.appointments.arrivalInstructions,
            serviceCategory: _schema.appointments.serviceCategory,
            startsAt: _schema.availabilitySlots.startsAt,
            durationMinutes: _schema.availabilitySlots.durationMinutes,
            providerName: _schema.providers.displayName,
            providerSpecialty: _schema.providers.specialty,
            serviceName: _schema.clinicalServices.name
        }).from(_schema.appointments).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).innerJoin(_schema.availabilitySlots, (0, _drizzleorm.eq)(_schema.appointments.availabilitySlotId, _schema.availabilitySlots.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.appointments.patientId, profile.id), (0, _drizzleorm.gt)(_schema.availabilitySlots.startsAt, now), (0, _drizzleorm.inArray)(_schema.appointments.status, [
            'slot_held',
            'confirmed'
        ]))).orderBy((0, _drizzleorm.asc)(_schema.availabilitySlots.startsAt)).limit(1);
        let upcomingWithSession = null;
        if (upcoming) {
            const isClinic = upcoming.consultationMode === 'in_person';
            let session = null;
            if (!isClinic) {
                const [foundSession] = await this.db.select({
                    status: _schema.consultationSessions.status,
                    roomName: _schema.consultationSessions.roomName
                }).from(_schema.consultationSessions).where((0, _drizzleorm.eq)(_schema.consultationSessions.appointmentId, upcoming.id));
                session = foundSession;
            }
            upcomingWithSession = {
                ...upcoming,
                isClinicAppointment: isClinic,
                consultationStatus: isClinic ? null : session?.status ?? 'booked',
                roomName: isClinic ? null : session?.roomName ?? null
            };
        }
        // 2. Latest active clinical care plan (GP aftercare)
        const [carePlan] = await this.db.select({
            id: _schema.carePlans.id,
            version: _schema.carePlans.version,
            status: _schema.carePlans.status,
            summary: _schema.carePlans.summary,
            followUpDueAt: _schema.carePlans.followUpDueAt,
            createdAt: _schema.carePlans.createdAt,
            providerName: _schema.providers.displayName
        }).from(_schema.carePlans).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.carePlans.encounterId, _schema.encounters.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.encounters.providerId, _schema.providers.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.encounters.patientId, profile.id), (0, _drizzleorm.eq)(_schema.carePlans.status, 'active'))).orderBy((0, _drizzleorm.desc)(_schema.carePlans.createdAt)).limit(1);
        // 3. Recent completed visits
        const recentVisits = await this.db.select({
            id: _schema.encounters.id,
            occurredAt: _schema.encounters.occurredAt,
            providerName: _schema.providers.displayName,
            providerSpecialty: _schema.providers.specialty
        }).from(_schema.encounters).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.encounters.providerId, _schema.providers.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, profile.id)).orderBy((0, _drizzleorm.desc)(_schema.encounters.occurredAt)).limit(3);
        // 4. Primary HMO coverage
        const [hmo] = await this.db.select({
            id: _schema.memberships.id,
            payerName: _schema.payers.name,
            payerCode: _schema.payers.code,
            memberId: _schema.memberships.memberId,
            planId: _schema.memberships.planId,
            verifiedAt: _schema.memberships.verifiedAt
        }).from(_schema.memberships).innerJoin(_schema.payers, (0, _drizzleorm.eq)(_schema.memberships.payerId, _schema.payers.id)).where((0, _drizzleorm.eq)(_schema.memberships.patientId, profile.id)).orderBy((0, _drizzleorm.desc)(_schema.memberships.createdAt)).limit(1);
        // 5. Unread notifications count
        const [{ unreadNotifications }] = await this.db.select({
            unreadNotifications: (0, _drizzleorm.count)()
        }).from(_schema.patientNotifications).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.patientNotifications.patientId, profile.id), (0, _drizzleorm.isNull)(_schema.patientNotifications.readAt)));
        // 6. Stats counts
        const [{ totalAppointments }] = await this.db.select({
            totalAppointments: (0, _drizzleorm.count)()
        }).from(_schema.appointments).where((0, _drizzleorm.eq)(_schema.appointments.patientId, profile.id));
        const [{ totalPrescriptions }] = await this.db.select({
            totalPrescriptions: (0, _drizzleorm.count)()
        }).from(_schema.prescriptions).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.prescriptions.encounterId, _schema.encounters.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, profile.id));
        const [{ totalMemberships }] = await this.db.select({
            totalMemberships: (0, _drizzleorm.count)()
        }).from(_schema.memberships).where((0, _drizzleorm.eq)(_schema.memberships.patientId, profile.id));
        const [{ totalDependants }] = await this.db.select({
            totalDependants: (0, _drizzleorm.count)()
        }).from(_schema.patientDependants).where((0, _drizzleorm.eq)(_schema.patientDependants.patientId, profile.id));
        const [{ totalCareArrangements }] = await this.db.select({
            totalCareArrangements: (0, _drizzleorm.count)()
        }).from(_schema.careArrangements).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.careArrangements.patientId, profile.id), (0, _drizzleorm.eq)(_schema.careArrangements.status, 'active')));
        const [{ totalInsurancePolicies }] = await this.db.select({
            totalInsurancePolicies: (0, _drizzleorm.count)()
        }).from(_schema.insurancePolicies).where((0, _drizzleorm.eq)(_schema.insurancePolicies.patientId, profile.id));
        const [{ totalShopOrders }] = await this.db.select({
            totalShopOrders: (0, _drizzleorm.count)()
        }).from(_schema.shopOrders).where((0, _drizzleorm.eq)(_schema.shopOrders.patientId, profile.id));
        return {
            account: {
                id: account.id,
                email: account.email,
                phoneNumber: account.phoneNumber,
                firstName: account.firstName,
                lastName: account.lastName,
                registeredName: accountFullName || null,
                status: account.status
            },
            profile,
            displayName: fullName,
            fullName,
            secondName,
            greeting,
            heading: 'How can we help today?',
            fourServices,
            quickLinks,
            upcomingAppointment: upcomingWithSession,
            activeCarePlan: carePlan ?? null,
            recentVisits,
            hmoCoverage: hmo ? {
                ...hmo,
                status: hmo.verifiedAt ? 'Approved' : 'Pending'
            } : null,
            unreadNotificationsCount: Number(unreadNotifications),
            stats: {
                totalAppointments: Number(totalAppointments),
                activePrescriptionsCount: Number(totalPrescriptions),
                linkedPayersCount: Number(totalMemberships),
                dependantsCount: Number(totalDependants),
                careArrangementsCount: Number(totalCareArrangements),
                linkedInsurancePoliciesCount: Number(totalInsurancePolicies),
                shopOrdersCount: Number(totalShopOrders)
            }
        };
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