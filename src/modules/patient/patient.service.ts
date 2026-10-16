import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, gt, ilike, inArray, isNull, or } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import {
  appointments,
  availabilitySlots,
  careArrangements,
  carePlans,
  clinicalServices,
  consultationSessions,
  encounters,
  insurancePolicies,
  memberships,
  patientAvatars,
  patientDependants,
  patientNotifications,
  patients,
  payers,
  prescriptions,
  providers,
  shopOrders,
  userAccounts,
} from '../../db/schema';
import { MAX_AVATAR_BYTES, type UploadAvatarDto } from '../../common/dto/avatar.dto';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { matchesImageType } from '../../common/images/image-type';
import type {
  CreateDependantDto,
  CreatePatientProfileDto,
  ListPatientsQueryDto,
  PatchMyProfileDto,
  UpdateDependantDto,
  UpdatePatientProfileDto,
  UpsertMyProfileDto,
} from './dto/patient.dto';

export type Patient = typeof patients.$inferSelect;
export type Dependant = typeof patientDependants.$inferSelect;

export interface MeResponse {
  account: {
    id: string;
    email: string;
    phoneNumber: string | null;
    firstName?: string | null;
    lastName?: string | null;
    registeredName?: string | null;
    status: string;
  };
  profile: Patient | null;
  /** "Ada Okafor" - user full name from clinical profile or registered account */
  displayName: string | null;
  fullName: string | null;
  secondName?: string | null;
}

function parseName(input: { fullName?: string | null; firstName?: string | null; lastName?: string | null }) {
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
    lastName: lastName || '',
  };
}

/** A patient row joined with its account's contact details — what the admin console lists. */
export type AdminPatientRow = Patient & {
  phoneNumber: string | null;
  email: string;
  accountStatus: string;
};

@Injectable()
export class PatientService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async createProfile(input: CreatePatientProfileDto): Promise<Patient> {
    const { fullName, ...rest } = input;
    const names = parseName({ fullName, firstName: input.firstName, lastName: input.lastName });
    const payload = {
      ...rest,
      firstName: names.firstName,
      lastName: names.lastName,
    };
    const [created] = await this.db.insert(patients).values(payload).returning();
    return created;
  }

  async getById(id: string): Promise<Patient & { registeredFirstName?: string | null; registeredLastName?: string | null; registeredName?: string; email?: string | null; phoneNumber?: string | null }> {
    const [found] = await this.db
      .select({
        ...getTableColumns(patients),
        registeredFirstName: userAccounts.firstName,
        registeredLastName: userAccounts.lastName,
        email: userAccounts.email,
        phoneNumber: userAccounts.phoneNumber,
      })
      .from(patients)
      .leftJoin(userAccounts, eq(patients.userAccountId, userAccounts.id))
      .where(or(eq(patients.id, id), eq(patients.userAccountId, id)));
    if (!found) throw new NotFoundAppException('Patient');
    const registeredName = [found.registeredFirstName, found.registeredLastName].filter(Boolean).join(' ').trim() || undefined;
    return {
      ...found,
      registeredName,
    };
  }

  /** `/admin/patients` — every patient with its account's contact details, searchable by name/email/phone. */
  async adminList(query: ListPatientsQueryDto): Promise<PaginatedResult<AdminPatientRow>> {
    const conditions = [];
    if (query.search) {
      const term = `%${query.search}%`;
      conditions.push(
        or(
          ilike(patients.firstName, term),
          ilike(patients.lastName, term),
          ilike(userAccounts.email, term),
          ilike(userAccounts.phoneNumber, term),
        ),
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(patients)
      .innerJoin(userAccounts, eq(patients.userAccountId, userAccounts.id))
      .where(where);

    const items = await this.db
      .select({
        ...getTableColumns(patients),
        phoneNumber: userAccounts.phoneNumber,
        email: userAccounts.email,
        accountStatus: userAccounts.status,
      })
      .from(patients)
      .innerJoin(userAccounts, eq(patients.userAccountId, userAccounts.id))
      .where(where)
      .orderBy(desc(patients.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  /** `/admin/patients/:id` — the joined row a list row links to, not the bare `getById()`. */
  async adminGetById(id: string): Promise<AdminPatientRow> {
    const [found] = await this.db
      .select({
        ...getTableColumns(patients),
        phoneNumber: userAccounts.phoneNumber,
        email: userAccounts.email,
        accountStatus: userAccounts.status,
      })
      .from(patients)
      .innerJoin(userAccounts, eq(patients.userAccountId, userAccounts.id))
      .where(eq(patients.id, id));
    if (!found) throw new NotFoundAppException('Patient');
    return found;
  }

  async getByUserAccountId(userAccountId: string): Promise<Patient | undefined> {
    const [found] = await this.db.select().from(patients).where(eq(patients.userAccountId, userAccountId));
    return found;
  }

  async update(id: string, input: UpdatePatientProfileDto): Promise<Patient> {
    const existing = await this.getById(id); // 404s early if missing
    const { fullName, ...rest } = input;
    const updatePayload: Record<string, unknown> = { ...rest };
    if (fullName !== undefined || input.firstName !== undefined || input.lastName !== undefined) {
      const names = parseName({
        fullName,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
      });
      updatePayload.firstName = names.firstName;
      updatePayload.lastName = names.lastName;
    }
    const [updated] = await this.db
      .update(patients)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  // ---- The signed-in patient's own data (`/me`) ----------------------------------------------

  async getMe(accountId: string): Promise<MeResponse> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, accountId));
    if (!account) throw new NotFoundAppException('Account');
    const profile = (await this.getByUserAccountId(accountId)) ?? null;
    const accountFullName = [account.firstName, account.lastName].filter(Boolean).join(' ').trim();
    const profileFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
    const fullName = profileFullName || accountFullName || null;
    const nameParts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const secondName = nameParts.length >= 2 ? nameParts[1] : (nameParts[0] || null);

    return {
      account: {
        id: account.id,
        email: account.email,
        phoneNumber: account.phoneNumber,
        firstName: account.firstName,
        lastName: account.lastName,
        registeredName: accountFullName || null,
        status: account.status,
      },
      profile,
      displayName: fullName,
      fullName,
      secondName,
    };
  }

  /** The patient row for a signed-in account, or a 409 telling the app to finish the profile first. */
  async requireProfile(accountId: string): Promise<Patient> {
    const profile = await this.getByUserAccountId(accountId);
    if (!profile) {
      throw new AppException('PROFILE_REQUIRED', 'Finish setting up your profile first.', HttpStatus.CONFLICT);
    }
    return profile;
  }

  /** Creates the profile on first call, updates it afterwards - idempotent for the app's sign-up step. */
  async upsertMyProfile(accountId: string, input: UpsertMyProfileDto): Promise<Patient> {
    const { fullName, ...rest } = input;
    const names = parseName({ fullName, firstName: input.firstName, lastName: input.lastName });
    const payload = {
      ...rest,
      firstName: names.firstName,
      lastName: names.lastName,
    };

    // Keep userAccounts in sync with profile name
    await this.db
      .update(userAccounts)
      .set({
        firstName: names.firstName,
        lastName: names.lastName,
      })
      .where(eq(userAccounts.id, accountId));

    const existing = await this.getByUserAccountId(accountId);
    if (existing) {
      const [updated] = await this.db
        .update(patients)
        .set({ ...payload, updatedAt: new Date() })
        .where(eq(patients.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await this.db.insert(patients).values({ ...payload, userAccountId: accountId }).returning();
    return created;
  }

  async patchMyProfile(accountId: string, input: PatchMyProfileDto): Promise<Patient> {
    const existing = await this.requireProfile(accountId);
    const { fullName, ...rest } = input;
    const updatePayload: Record<string, unknown> = { ...rest };

    if (fullName !== undefined || input.firstName !== undefined || input.lastName !== undefined) {
      const names = parseName({
        fullName,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
      });
      updatePayload.firstName = names.firstName;
      updatePayload.lastName = names.lastName;

      await this.db
        .update(userAccounts)
        .set({
          firstName: names.firstName,
          lastName: names.lastName,
        })
        .where(eq(userAccounts.id, accountId));
    }

    const [updated] = await this.db
      .update(patients)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(eq(patients.id, existing.id))
      .returning();
    return updated;
  }

  async setMyAvatar(accountId: string, input: UploadAvatarDto): Promise<Patient> {
    const image = Buffer.from(input.data, 'base64');
    if (image.length === 0 || image.length > MAX_AVATAR_BYTES) {
      throw new AppException('AVATAR_TOO_LARGE', 'Profile photos must be under 512 KB.', HttpStatus.BAD_REQUEST);
    }
    if (!matchesImageType(image, input.contentType)) {
      throw new AppException('AVATAR_INVALID_IMAGE', 'That file is not a valid JPEG, PNG or WebP image.', HttpStatus.BAD_REQUEST);
    }

    const profile = await this.requireProfile(accountId);
    const now = new Date();
    return this.db.transaction(async (tx) => {
      await tx
        .insert(patientAvatars)
        .values({ patientId: profile.id, contentType: input.contentType, image, updatedAt: now })
        .onConflictDoUpdate({ target: patientAvatars.patientId, set: { contentType: input.contentType, image, updatedAt: now } });
      const [updated] = await tx
        .update(patients)
        .set({ avatarUpdatedAt: now, updatedAt: now })
        .where(eq(patients.id, profile.id))
        .returning();
      return updated;
    });
  }

  async removeMyAvatar(accountId: string): Promise<Patient> {
    const profile = await this.requireProfile(accountId);
    return this.db.transaction(async (tx) => {
      await tx.delete(patientAvatars).where(eq(patientAvatars.patientId, profile.id));
      const [updated] = await tx
        .update(patients)
        .set({ avatarUpdatedAt: null, updatedAt: new Date() })
        .where(eq(patients.id, profile.id))
        .returning();
      return updated;
    });
  }

  async getMyAvatar(accountId: string): Promise<{ contentType: string; image: Buffer }> {
    const profile = await this.requireProfile(accountId);
    const [avatar] = await this.db
      .select({ contentType: patientAvatars.contentType, image: patientAvatars.image })
      .from(patientAvatars)
      .where(eq(patientAvatars.patientId, profile.id));
    if (!avatar) throw new NotFoundAppException('Profile photo');
    return avatar;
  }

  // ---- Dependants --------------------------------------------------------------------------

  async listDependants(accountId: string): Promise<Dependant[]> {
    const profile = await this.requireProfile(accountId);
    return this.db
      .select()
      .from(patientDependants)
      .where(eq(patientDependants.patientId, profile.id))
      .orderBy(desc(patientDependants.createdAt));
  }

  async createDependant(accountId: string, input: CreateDependantDto): Promise<Dependant> {
    const profile = await this.requireProfile(accountId);
    const [created] = await this.db
      .insert(patientDependants)
      .values({
        patientId: profile.id,
        firstName: input.firstName,
        lastName: input.lastName,
        relationship: input.relationship,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        bloodGroup: input.bloodGroup,
        genotype: input.genotype,
        status: input.status ?? 'Covered',
      })
      .returning();
    return created;
  }

  async updateDependant(accountId: string, dependantId: string, input: UpdateDependantDto): Promise<Dependant> {
    const profile = await this.requireProfile(accountId);
    const [found] = await this.db
      .select()
      .from(patientDependants)
      .where(and(eq(patientDependants.id, dependantId), eq(patientDependants.patientId, profile.id)));
    if (!found) throw new NotFoundAppException('Dependant');

    const [updated] = await this.db
      .update(patientDependants)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(patientDependants.id, dependantId))
      .returning();
    return updated;
  }

  async deleteDependant(accountId: string, dependantId: string): Promise<void> {
    const profile = await this.requireProfile(accountId);
    const [found] = await this.db
      .select()
      .from(patientDependants)
      .where(and(eq(patientDependants.id, dependantId), eq(patientDependants.patientId, profile.id)));
    if (!found) throw new NotFoundAppException('Dependant');

    await this.db.delete(patientDependants).where(eq(patientDependants.id, dependantId));
  }

  // ---- Patient Dashboard -------------------------------------------------------------------

  async getDashboard(accountId: string) {
    const profile = await this.getByUserAccountId(accountId);
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, accountId));
    if (!account) throw new NotFoundAppException('Account');

    const accountFullName = [account.firstName, account.lastName].filter(Boolean).join(' ').trim();
    const profileFullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
    const fullName = profileFullName || accountFullName || null;
    const nameParts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    const secondName = nameParts.length >= 2 ? nameParts[1] : (nameParts[0] || null);

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
        action: 'Book a GP appointment',
      },
      {
        id: 'care',
        title: 'Care',
        subtitle: 'Professional care & support',
        destination: '/care',
        icon: 'hand-heart',
        action: 'Request a care assessment',
      },
      {
        id: 'wellbeing',
        title: 'Wellbeing',
        subtitle: 'Coaching, sessions & shop',
        destination: '/wellbeing',
        icon: 'leaf',
        action: 'Explore sessions or shop',
      },
      {
        id: 'insurance',
        title: 'Insurance',
        subtitle: 'Explore cover & manage policies',
        destination: '/insurance',
        icon: 'shield-check',
        action: 'Explore cover or view policies',
      },
    ];

    const quickLinks = {
      bookGp: { label: 'Book a GP appointment', route: '/gp/book' },
      visits: { label: 'Visits — Appointments & care visits', route: '/me/visits' },
      healthRecords: { label: 'Health records — Your records & care plans', route: '/records' },
      membership: { label: 'Membership & benefits — View your access and funding', route: '/membership' },
      urgentHelp: { label: 'Need urgent help? View emergency guidance.', route: '/services/emergency-guidance' },
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
          status: account.status,
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
          shopOrdersCount: 0,
        },
      };
    }

    // 1. Upcoming appointment
    const [upcoming] = await this.db
      .select({
        id: appointments.id,
        status: appointments.status,
        consultationMode: appointments.consultationMode,
        locationCity: appointments.locationCity,
        clinicName: appointments.clinicName,
        clinicAddress: appointments.clinicAddress,
        arrivalInstructions: appointments.arrivalInstructions,
        serviceCategory: appointments.serviceCategory,
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
        providerName: providers.displayName,
        providerSpecialty: providers.specialty,
        serviceName: clinicalServices.name,
      })
      .from(appointments)
      .innerJoin(providers, eq(appointments.providerId, providers.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .where(
        and(
          eq(appointments.patientId, profile.id),
          gt(availabilitySlots.startsAt, now),
          inArray(appointments.status, ['slot_held', 'confirmed']),
        ),
      )
      .orderBy(asc(availabilitySlots.startsAt))
      .limit(1);

    let upcomingWithSession = null;
    if (upcoming) {
      const isClinic = upcoming.consultationMode === 'in_person';
      let session = null;
      if (!isClinic) {
        const [foundSession] = await this.db
          .select({ status: consultationSessions.status, roomName: consultationSessions.roomName })
          .from(consultationSessions)
          .where(eq(consultationSessions.appointmentId, upcoming.id));
        session = foundSession;
      }

      upcomingWithSession = {
        ...upcoming,
        isClinicAppointment: isClinic,
        consultationStatus: isClinic ? null : session?.status ?? 'booked',
        roomName: isClinic ? null : session?.roomName ?? null,
      };
    }

    // 2. Latest active clinical care plan (GP aftercare)
    const [carePlan] = await this.db
      .select({
        id: carePlans.id,
        version: carePlans.version,
        status: carePlans.status,
        summary: carePlans.summary,
        followUpDueAt: carePlans.followUpDueAt,
        createdAt: carePlans.createdAt,
        providerName: providers.displayName,
      })
      .from(carePlans)
      .innerJoin(encounters, eq(carePlans.encounterId, encounters.id))
      .innerJoin(providers, eq(encounters.providerId, providers.id))
      .where(and(eq(encounters.patientId, profile.id), eq(carePlans.status, 'active')))
      .orderBy(desc(carePlans.createdAt))
      .limit(1);

    // 3. Recent completed visits
    const recentVisits = await this.db
      .select({
        id: encounters.id,
        occurredAt: encounters.occurredAt,
        providerName: providers.displayName,
        providerSpecialty: providers.specialty,
      })
      .from(encounters)
      .innerJoin(providers, eq(encounters.providerId, providers.id))
      .where(eq(encounters.patientId, profile.id))
      .orderBy(desc(encounters.occurredAt))
      .limit(3);

    // 4. Primary HMO coverage
    const [hmo] = await this.db
      .select({
        id: memberships.id,
        payerName: payers.name,
        payerCode: payers.code,
        memberId: memberships.memberId,
        planId: memberships.planId,
        verifiedAt: memberships.verifiedAt,
      })
      .from(memberships)
      .innerJoin(payers, eq(memberships.payerId, payers.id))
      .where(eq(memberships.patientId, profile.id))
      .orderBy(desc(memberships.createdAt))
      .limit(1);

    // 5. Unread notifications count
    const [{ unreadNotifications }] = await this.db
      .select({ unreadNotifications: count() })
      .from(patientNotifications)
      .where(and(eq(patientNotifications.patientId, profile.id), isNull(patientNotifications.readAt)));

    // 6. Stats counts
    const [{ totalAppointments }] = await this.db
      .select({ totalAppointments: count() })
      .from(appointments)
      .where(eq(appointments.patientId, profile.id));

    const [{ totalPrescriptions }] = await this.db
      .select({ totalPrescriptions: count() })
      .from(prescriptions)
      .innerJoin(encounters, eq(prescriptions.encounterId, encounters.id))
      .where(eq(encounters.patientId, profile.id));

    const [{ totalMemberships }] = await this.db
      .select({ totalMemberships: count() })
      .from(memberships)
      .where(eq(memberships.patientId, profile.id));

    const [{ totalDependants }] = await this.db
      .select({ totalDependants: count() })
      .from(patientDependants)
      .where(eq(patientDependants.patientId, profile.id));

    const [{ totalCareArrangements }] = await this.db
      .select({ totalCareArrangements: count() })
      .from(careArrangements)
      .where(and(eq(careArrangements.patientId, profile.id), eq(careArrangements.status, 'active')));

    const [{ totalInsurancePolicies }] = await this.db
      .select({ totalInsurancePolicies: count() })
      .from(insurancePolicies)
      .where(eq(insurancePolicies.patientId, profile.id));

    const [{ totalShopOrders }] = await this.db
      .select({ totalShopOrders: count() })
      .from(shopOrders)
      .where(eq(shopOrders.patientId, profile.id));

    return {
      account: {
        id: account.id,
        email: account.email,
        phoneNumber: account.phoneNumber,
        firstName: account.firstName,
        lastName: account.lastName,
        registeredName: accountFullName || null,
        status: account.status,
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
      hmoCoverage: hmo ? { ...hmo, status: hmo.verifiedAt ? 'Approved' : 'Pending' } : null,
      unreadNotificationsCount: Number(unreadNotifications),
      stats: {
        totalAppointments: Number(totalAppointments),
        activePrescriptionsCount: Number(totalPrescriptions),
        linkedPayersCount: Number(totalMemberships),
        dependantsCount: Number(totalDependants),
        careArrangementsCount: Number(totalCareArrangements),
        linkedInsurancePoliciesCount: Number(totalInsurancePolicies),
        shopOrdersCount: Number(totalShopOrders),
      },
    };
  }
}
