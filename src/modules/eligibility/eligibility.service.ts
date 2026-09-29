import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq, getTableColumns, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { clinicalServices, eligibilityChecks, memberships, patients, payers } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { AuditService } from '../audit/audit.service';
import { PayerAdapterRegistry } from '../payer/adapters/payer-adapter.registry';
import type { ListEligibilityChecksQueryDto } from './dto/eligibility.dto';

export type EligibilityCheck = typeof eligibilityChecks.$inferSelect;

/** An eligibility-check row joined with the names `/admin/eligibility-checks` shows. */
export type AdminEligibilityCheckRow = EligibilityCheck & {
  patientName: string;
  payerName: string;
  serviceName: string;
};

/**
 * Service-level eligibility (view 09 — Check Service Eligibility). Kept as its own module,
 * separate from `PayerModule`'s membership verification, because it is a distinct decision with
 * its own state machine (blueprint §4.1, §7) even though both go through the same payer adapter.
 */
@Injectable()
export class EligibilityService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly registry: PayerAdapterRegistry,
    private readonly audit: AuditService,
  ) {}

  async check(membershipId: string, clinicalServiceCode: string): Promise<EligibilityCheck> {
    const [membership] = await this.db.select().from(memberships).where(eq(memberships.id, membershipId));
    if (!membership) throw new NotFoundAppException('Membership');

    const [payer] = await this.db.select().from(payers).where(eq(payers.id, membership.payerId));
    const [service] = await this.db.select().from(clinicalServices).where(eq(clinicalServices.code, clinicalServiceCode));
    if (!service) throw new NotFoundAppException('Clinical service');

    const adapter = this.registry.get(payer.code);
    const result = await adapter.checkEligibility({
      payerCode: payer.code,
      memberId: membership.memberId,
      planId: membership.planId ?? undefined,
      clinicalServiceCode,
      date: new Date().toISOString().slice(0, 10),
    });

    await this.audit.record({
      actorType: 'patient',
      actorId: membership.patientId,
      action: 'payer_decision',
      resourceType: 'eligibility_check',
      resourceId: membershipId,
      metadata: { clinicalServiceCode, status: result.status },
    });

    const [check] = await this.db
      .insert(eligibilityChecks)
      .values({
        membershipId,
        clinicalServiceId: service.id,
        status: result.status,
        coPayKobo: result.coPayKobo?.toString(),
        rawResponse: result.raw ?? {},
      })
      .returning();

    return check;
  }

  /** `/admin/eligibility-checks` — the "Eligibility" page in the operations console. */
  async adminList(query: ListEligibilityChecksQueryDto): Promise<PaginatedResult<AdminEligibilityCheckRow>> {
    const where = query.status ? eq(eligibilityChecks.status, query.status) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(eligibilityChecks).where(where);
    const items = await this.db
      .select({
        ...getTableColumns(eligibilityChecks),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        payerName: payers.name,
        serviceName: clinicalServices.name,
      })
      .from(eligibilityChecks)
      .innerJoin(memberships, eq(eligibilityChecks.membershipId, memberships.id))
      .innerJoin(patients, eq(memberships.patientId, patients.id))
      .innerJoin(payers, eq(memberships.payerId, payers.id))
      .innerJoin(clinicalServices, eq(eligibilityChecks.clinicalServiceId, clinicalServices.id))
      .where(where)
      .orderBy(desc(eligibilityChecks.checkedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }
}
