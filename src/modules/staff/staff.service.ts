import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { hashPassword, verifyPassword } from '../../common/security/password';
import { DRIZZLE, type Database } from '../../db/client';
import { staffAccounts, staffAvatars } from '../../db/schema';
import {
  MAX_AVATAR_BYTES,
  type ChangeOwnPasswordDto,
  type CreateStaffDto,
  type ListStaffQueryDto,
  type UpdateStaffDto,
  type UploadAvatarDto,
} from './dto/staff.dto';

export type StaffAccount = typeof staffAccounts.$inferSelect;
export type StaffSummary = Omit<StaffAccount, 'passwordHash'>;

function toSummary(account: StaffAccount): StaffSummary {
  const summary: Partial<StaffAccount> = { ...account };
  delete summary.passwordHash;
  return summary as StaffSummary;
}

/**
 * Operations-console staff accounts. Deliberately its own module rather than folded into
 * `IdentityModule` — see `staff.schema.ts` for why staff and patients are separate tables.
 */
@Injectable()
export class StaffService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: CreateStaffDto): Promise<StaffSummary> {
    const [existing] = await this.db.select().from(staffAccounts).where(eq(staffAccounts.email, input.email));
    if (existing) {
      throw new AppException('STAFF_EMAIL_TAKEN', 'A staff account with this email already exists.', HttpStatus.CONFLICT);
    }

    const passwordHash = await hashPassword(input.password);
    const [created] = await this.db
      .insert(staffAccounts)
      .values({ email: input.email, passwordHash, fullName: input.fullName, role: input.role })
      .returning();

    return toSummary(created);
  }

  async list(query: ListStaffQueryDto): Promise<PaginatedResult<StaffSummary>> {
    const conditions = [];
    if (query.role) conditions.push(eq(staffAccounts.role, query.role));
    if (query.status) conditions.push(eq(staffAccounts.status, query.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(staffAccounts).where(where);
    const rows = await this.db
      .select()
      .from(staffAccounts)
      .where(where)
      .orderBy(desc(staffAccounts.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(rows.map(toSummary), total, query.page, query.pageSize);
  }

  async getById(id: string): Promise<StaffSummary> {
    const [account] = await this.db.select().from(staffAccounts).where(eq(staffAccounts.id, id));
    if (!account) throw new NotFoundAppException('Staff account');
    return toSummary(account);
  }

  async update(id: string, input: UpdateStaffDto): Promise<StaffSummary> {
    await this.getById(id); // 404s early if missing
    const [updated] = await this.db
      .update(staffAccounts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(staffAccounts.id, id))
      .returning();
    return toSummary(updated);
  }

  /** Self-service password change: the current password is required, so a stolen-but-unexpired
   * session token alone can't lock the real owner out. */
  async changePassword(id: string, input: ChangeOwnPasswordDto): Promise<void> {
    const [account] = await this.db.select().from(staffAccounts).where(eq(staffAccounts.id, id));
    if (!account) throw new NotFoundAppException('Staff account');

    const valid = await verifyPassword(input.currentPassword, account.passwordHash);
    if (!valid) {
      throw new AppException('INVALID_CURRENT_PASSWORD', 'Your current password is incorrect.', HttpStatus.BAD_REQUEST);
    }

    const passwordHash = await hashPassword(input.newPassword);
    await this.db
      .update(staffAccounts)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(staffAccounts.id, id));
  }

  /** Replaces the staff member's profile photo. The bytes must really be the declared image type,
   * so a renamed file (or anything else) can't be stored and later served as an image. */
  async setAvatar(id: string, input: UploadAvatarDto): Promise<StaffSummary> {
    const image = Buffer.from(input.data, 'base64');
    if (image.length === 0 || image.length > MAX_AVATAR_BYTES) {
      throw new AppException('AVATAR_TOO_LARGE', 'Profile photos must be under 512 KB.', HttpStatus.BAD_REQUEST);
    }
    if (!matchesImageType(image, input.contentType)) {
      throw new AppException('AVATAR_INVALID_IMAGE', 'That file is not a valid JPEG, PNG or WebP image.', HttpStatus.BAD_REQUEST);
    }

    await this.getById(id);
    const now = new Date();
    return this.db.transaction(async (tx) => {
      await tx
        .insert(staffAvatars)
        .values({ staffAccountId: id, contentType: input.contentType, image, updatedAt: now })
        .onConflictDoUpdate({
          target: staffAvatars.staffAccountId,
          set: { contentType: input.contentType, image, updatedAt: now },
        });
      const [updated] = await tx
        .update(staffAccounts)
        .set({ avatarUpdatedAt: now, updatedAt: now })
        .where(eq(staffAccounts.id, id))
        .returning();
      return toSummary(updated);
    });
  }

  async removeAvatar(id: string): Promise<StaffSummary> {
    await this.getById(id);
    return this.db.transaction(async (tx) => {
      await tx.delete(staffAvatars).where(eq(staffAvatars.staffAccountId, id));
      const [updated] = await tx
        .update(staffAccounts)
        .set({ avatarUpdatedAt: null, updatedAt: new Date() })
        .where(eq(staffAccounts.id, id))
        .returning();
      return toSummary(updated);
    });
  }

  async getAvatar(id: string): Promise<{ contentType: string; image: Buffer }> {
    const [avatar] = await this.db
      .select({ contentType: staffAvatars.contentType, image: staffAvatars.image })
      .from(staffAvatars)
      .where(eq(staffAvatars.staffAccountId, id));
    if (!avatar) throw new NotFoundAppException('Profile photo');
    return avatar;
  }

  /** Used by `AuthService.login` only — never returns the password hash outward. */
  async verifyCredentials(email: string, password: string): Promise<StaffSummary | null> {
    const [account] = await this.db.select().from(staffAccounts).where(eq(staffAccounts.email, email));
    if (!account || account.status !== 'active') return null;

    const valid = await verifyPassword(password, account.passwordHash);
    if (!valid) return null;

    const [updated] = await this.db
      .update(staffAccounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(staffAccounts.id, account.id))
      .returning();

    return toSummary(updated);
  }
}

/** Checks the file's leading "magic" bytes against its declared type. */
function matchesImageType(image: Buffer, contentType: UploadAvatarDto['contentType']): boolean {
  switch (contentType) {
    case 'image/jpeg':
      return image.length > 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    case 'image/png':
      return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return image.length > 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  }
}
