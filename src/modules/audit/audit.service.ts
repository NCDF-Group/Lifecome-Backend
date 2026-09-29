import { createHash } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { auditEvents } from '../../db/schema';
import type { auditActionEnum } from '../../db/schema';
import type { ListAuditEventsQueryDto } from './dto/audit.dto';

export type AuditEvent = typeof auditEvents.$inferSelect;

export interface RecordAuditEventInput {
  actorType: 'patient' | 'provider' | 'staff' | 'system';
  actorId: string;
  action: (typeof auditActionEnum.enumValues)[number];
  resourceType: string;
  resourceId: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Append-only audit log with a simple hash chain: each row's `hash` covers its own payload plus
 * the previous row's hash, so deleting or editing a row breaks the chain from that point forward
 * and is detectable by re-walking it (blueprint §12 — immutable audit trails).
 *
 * This module never exposes an update or delete method on purpose.
 */
@Injectable()
export class AuditService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async record(input: RecordAuditEventInput): Promise<void> {
    const [last] = await this.db
      .select({ hash: auditEvents.hash })
      .from(auditEvents)
      .orderBy(desc(auditEvents.occurredAt))
      .limit(1);

    const previousHash = last?.hash ?? null;
    const metadata = input.metadata ?? {};
    const hash = createHash('sha256')
      .update(JSON.stringify({ previousHash, ...input, metadata }))
      .digest('hex');

    await this.db.insert(auditEvents).values({
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      correlationId: input.correlationId,
      metadata,
      previousHash,
      hash,
    });
  }

  /**
   * `/admin/audit-events` — the "Audit log" page in the operations console. Read-only, same as
   * every other method here: nothing in this service ever updates or deletes a row.
   */
  async list(query: ListAuditEventsQueryDto): Promise<PaginatedResult<AuditEvent>> {
    const conditions = [];
    if (query.actorType) conditions.push(eq(auditEvents.actorType, query.actorType));
    if (query.resourceType) conditions.push(eq(auditEvents.resourceType, query.resourceType));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(auditEvents).where(where);
    const items = await this.db
      .select()
      .from(auditEvents)
      .where(where)
      .orderBy(desc(auditEvents.occurredAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }
}
