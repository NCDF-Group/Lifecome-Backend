import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, getTableColumns, ilike, or } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { patients, userAccounts } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { CreatePatientProfileDto, ListPatientsQueryDto, UpdatePatientProfileDto } from './dto/patient.dto';

export type Patient = typeof patients.$inferSelect;

/** A patient row joined with its account's contact details — what the admin console lists. */
export type AdminPatientRow = Patient & {
  phoneNumber: string;
  email: string | null;
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
}
