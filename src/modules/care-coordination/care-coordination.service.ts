import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { careTasks } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { CreateCareTaskDto } from './dto/care-coordination.dto';

export type CareTask = typeof careTasks.$inferSelect;

/** Follow-up tasks and provider handoffs, tracked independently of the clinical note that prompted them. */
@Injectable()
export class CareCoordinationService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: CreateCareTaskDto): Promise<CareTask> {
    const [task] = await this.db
      .insert(careTasks)
      .values({ ...input, dueAt: input.dueAt ? new Date(input.dueAt) : undefined })
      .returning();
    return task;
  }

  listForPatient(patientId: string): Promise<CareTask[]> {
    return this.db.select().from(careTasks).where(eq(careTasks.patientId, patientId));
  }

  listForProvider(providerId: string): Promise<CareTask[]> {
    return this.db
      .select()
      .from(careTasks)
      .where(and(eq(careTasks.assignedToProviderId, providerId), eq(careTasks.status, 'open')));
  }

  async complete(id: string): Promise<CareTask> {
    const [updated] = await this.db
      .update(careTasks)
      .set({ status: 'done', completedAt: new Date() })
      .where(eq(careTasks.id, id))
      .returning();
    if (!updated) throw new NotFoundAppException('Care task');
    return updated;
  }
}
