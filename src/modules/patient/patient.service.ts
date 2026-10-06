import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, getTableColumns, ilike, or } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { patientAvatars, patients, userAccounts } from '../../db/schema';
import { MAX_AVATAR_BYTES, type UploadAvatarDto } from '../../common/dto/avatar.dto';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { matchesImageType } from '../../common/images/image-type';
import type {
  CreatePatientProfileDto,
  ListPatientsQueryDto,
  PatchMyProfileDto,
  UpdatePatientProfileDto,
  UpsertMyProfileDto,
} from './dto/patient.dto';

export type Patient = typeof patients.$inferSelect;

/** What `GET /me` returns: the sign-in account plus the clinical profile (null until it's created). */
export interface MeResponse {
  account: { id: string; email: string; phoneNumber: string | null; status: string };
  profile: Patient | null;
  /** "Ada Okafor" - null until a profile exists, so the app never has to fall back to the email. */
  displayName: string | null;
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
    const [created] = await this.db.insert(patients).values(input).returning();
    return created;
  }

  async getById(id: string): Promise<Patient> {
    const [found] = await this.db.select().from(patients).where(eq(patients.id, id));
    if (!found) throw new NotFoundAppException('Patient');
    return found;
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
    await this.getById(id); // 404s early if missing
    const [updated] = await this.db
      .update(patients)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  // ---- The signed-in patient's own data (`/me`) ----------------------------------------------

  async getMe(accountId: string): Promise<MeResponse> {
    const [account] = await this.db.select().from(userAccounts).where(eq(userAccounts.id, accountId));
    if (!account) throw new NotFoundAppException('Account');
    const profile = (await this.getByUserAccountId(accountId)) ?? null;
    return {
      account: { id: account.id, email: account.email, phoneNumber: account.phoneNumber, status: account.status },
      profile,
      displayName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : null,
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
    const existing = await this.getByUserAccountId(accountId);
    if (existing) {
      const [updated] = await this.db
        .update(patients)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(patients.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await this.db.insert(patients).values({ ...input, userAccountId: accountId }).returning();
    return created;
  }

  async patchMyProfile(accountId: string, input: PatchMyProfileDto): Promise<Patient> {
    const existing = await this.requireProfile(accountId);
    const [updated] = await this.db
      .update(patients)
      .set({ ...input, updatedAt: new Date() })
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
}
