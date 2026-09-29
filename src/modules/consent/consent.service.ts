import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, getTableColumns, isNotNull, isNull, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { consentRecords, patients } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { GrantConsentDto, ListConsentRecordsQueryDto } from './dto/consent.dto';

export type ConsentRecord = typeof consentRecords.$inferSelect;

/** A consent row joined with the patient name `/admin/consent` shows instead of a raw patientId. */
export type AdminConsentRow = ConsentRecord & { patientName: string };

/** Versioned consent (blueprint §7 — "Consent": purpose/version/timestamp/channel, never overwritten). */
@Injectable()
export class ConsentService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async grant(input: GrantConsentDto): Promise<ConsentRecord> {
    const [record] = await this.db.insert(consentRecords).values(input).returning();
    return record;
  }

  async revoke(id: string): Promise<ConsentRecord> {
    const [updated] = await this.db
      .update(consentRecords)
      .set({ revokedAt: new Date() })
      .where(eq(consentRecords.id, id))
      .returning();
    if (!updated) throw new NotFoundAppException('Consent record');
    return updated;
  }

  list(patientId: string): Promise<ConsentRecord[]> {
    return this.db.select().from(consentRecords).where(eq(consentRecords.patientId, patientId));
  }

  /** `/admin/consent` — every patient's consent records, not just one. */
  async adminList(query: ListConsentRecordsQueryDto): Promise<PaginatedResult<AdminConsentRow>> {
    const conditions = [];
    if (query.consentType) conditions.push(eq(consentRecords.consentType, query.consentType));
    if (query.revoked !== undefined) {
      conditions.push(query.revoked ? isNotNull(consentRecords.revokedAt) : isNull(consentRecords.revokedAt));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(consentRecords)
      .innerJoin(patients, eq(consentRecords.patientId, patients.id))
      .where(where);

    const items = await this.db
      .select({
        ...getTableColumns(consentRecords),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
      })
      .from(consentRecords)
      .innerJoin(patients, eq(consentRecords.patientId, patients.id))
      .where(where)
      .orderBy(desc(consentRecords.grantedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  async hasActiveConsent(patientId: string, consentType: ConsentRecord['consentType']): Promise<boolean> {
    const [record] = await this.db
      .select({ id: consentRecords.id })
      .from(consentRecords)
      .where(
        and(eq(consentRecords.patientId, patientId), eq(consentRecords.consentType, consentType), isNull(consentRecords.revokedAt)),
      )
      .limit(1);
    return Boolean(record);
  }
}
