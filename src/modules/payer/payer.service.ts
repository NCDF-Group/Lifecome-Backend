import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { memberships, payers } from '../../db/schema';
import { AppException } from '../../common/errors/app-exception';
import { AuditService } from '../audit/audit.service';
import { PayerAdapterRegistry } from './adapters/payer-adapter.registry';

export type Payer = typeof payers.$inferSelect;
export type Membership = typeof memberships.$inferSelect;

@Injectable()
export class PayerService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly registry: PayerAdapterRegistry,
    private readonly audit: AuditService,
  ) {}

  /**
   * Live payers only, in `displayOrder` — the field a product decision (e.g. "list LifeCome HMO
   * first") lives in, never in code (blueprint §9.1, §21).
   */
  async listParticipatingPayers(): Promise<Payer[]> {
    return this.db.select().from(payers).where(eq(payers.isLive, true)).orderBy(asc(payers.displayOrder));
  }

  async verifyMembership(patientId: string, payerCode: string, memberId: string): Promise<Membership> {
    const payer = await this.getLivePayerByCode(payerCode);
    const adapter = this.registry.get(payerCode);

    const result = await adapter.verifyMember({ payerCode, memberId, patientDateOfBirth: '' });

    await this.audit.record({
      actorType: 'patient',
      actorId: patientId,
      action: 'payer_decision',
      resourceType: 'membership_verification',
      resourceId: `${payerCode}:${memberId}`,
      metadata: { status: result.status },
    });

    if (result.status !== 'verified') {
      throw new AppException('MEMBERSHIP_NOT_VERIFIED', `Your membership could not be verified (${result.status}).`, 422);
    }

    const [membership] = await this.db
      .insert(memberships)
      .values({ patientId, payerId: payer.id, memberId, planId: result.planId, verifiedAt: new Date() })
      .returning();

    return membership;
  }

  private async getLivePayerByCode(code: string): Promise<Payer> {
    const [payer] = await this.db.select().from(payers).where(eq(payers.code, code));
    if (!payer || !payer.isLive) {
      throw new AppException('PAYER_NOT_AVAILABLE', 'This payer is not currently available. You can pay directly instead.', 422);
    }
    return payer;
  }
}
