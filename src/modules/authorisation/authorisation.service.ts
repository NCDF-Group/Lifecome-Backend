import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { authorisations, eligibilityChecks, memberships, payers } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { AuditService } from '../audit/audit.service';
import { PayerAdapterRegistry } from '../payer/adapters/payer-adapter.registry';
import type { RequestAuthorisationDto } from './dto/authorisation.dto';

export type Authorisation = typeof authorisations.$inferSelect;

/**
 * Pre-authorisation requests and their status (blueprint §4.1 — its own state machine, separate
 * from eligibility: a service can be "covered, pre-authorisation required" and the authorisation
 * itself then moves pending → approved/declined/expired independently).
 */
@Injectable()
export class AuthorisationService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly registry: PayerAdapterRegistry,
    private readonly audit: AuditService,
  ) {}

  async request(input: RequestAuthorisationDto): Promise<Authorisation> {
    const [eligibilityCheck] = await this.db
      .select()
      .from(eligibilityChecks)
      .where(eq(eligibilityChecks.id, input.eligibilityCheckId));
    if (!eligibilityCheck) throw new NotFoundAppException('Eligibility check');

    const [membership] = await this.db.select().from(memberships).where(eq(memberships.id, eligibilityCheck.membershipId));
    const [payer] = await this.db.select().from(payers).where(eq(payers.id, membership.payerId));

    const adapter = this.registry.get(payer.code);
    const result = await adapter.requestAuthorisation({
      payerCode: payer.code,
      memberId: membership.memberId,
      clinicalServiceCode: input.clinicalServiceCode,
      providerId: input.providerId,
      appointmentId: input.appointmentId,
    });

    const [authorisation] = await this.db
      .insert(authorisations)
      .values({
        eligibilityCheckId: input.eligibilityCheckId,
        payerId: payer.id,
        status: result.status,
        payerReference: result.payerReference,
        infoRequested: result.infoRequested,
        decidedAt: result.status === 'pending' ? null : new Date(),
      })
      .returning();

    await this.audit.record({
      actorType: 'patient',
      actorId: membership.patientId,
      action: 'payer_decision',
      resourceType: 'authorisation',
      resourceId: authorisation.id,
      metadata: { status: result.status },
    });

    return authorisation;
  }

  /** Re-polls the payer for a pending authorisation and persists any change in status. */
  async refreshStatus(authorisationId: string): Promise<Authorisation> {
    const [authorisation] = await this.db.select().from(authorisations).where(eq(authorisations.id, authorisationId));
    if (!authorisation) throw new NotFoundAppException('Authorisation');
    if (authorisation.status !== 'pending' || !authorisation.payerReference) {
      return authorisation;
    }

    const [payer] = await this.db.select().from(payers).where(eq(payers.id, authorisation.payerId));
    const adapter = this.registry.get(payer.code);
    const result = await adapter.getAuthorisationStatus(authorisation.payerReference);

    const [updated] = await this.db
      .update(authorisations)
      .set({ status: result.status, decidedAt: result.status === 'pending' ? null : new Date() })
      .where(eq(authorisations.id, authorisationId))
      .returning();

    return updated;
  }
}
