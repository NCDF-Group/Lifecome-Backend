import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

import { NotFoundAppException } from '../../common/errors/app-exception';
import { DRIZZLE, type Database } from '../../db/client';
import { patientNotifications } from '../../db/schema';
import { PatientService } from '../patient/patient.service';

export type PatientNotification = typeof patientNotifications.$inferSelect;
export type NewPatientNotification = Omit<typeof patientNotifications.$inferInsert, 'id' | 'readAt' | 'createdAt'>;

const FEED_LIMIT = 50;

/** The patient's in-app notification feed. */
@Injectable()
export class PatientNotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
    @InjectPinoLogger(PatientNotificationsService.name) private readonly logger: PinoLogger,
  ) {}

  /**
   * Adds a notification to a patient's feed. Never throws: a notification is a courtesy, so a failure
   * here must not undo the booking or reply that triggered it.
   */
  async notify(input: NewPatientNotification): Promise<void> {
    try {
      await this.db.insert(patientNotifications).values(input);
    } catch (error) {
      this.logger.error({ err: error, patientId: input.patientId, kind: input.kind }, 'Could not record a patient notification');
    }
  }

  async list(accountId: string): Promise<{ items: PatientNotification[]; unreadCount: number }> {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return { items: [], unreadCount: 0 };

    const items = await this.db
      .select()
      .from(patientNotifications)
      .where(eq(patientNotifications.patientId, patient.id))
      .orderBy(desc(patientNotifications.createdAt))
      .limit(FEED_LIMIT);
    const [{ unread }] = await this.db
      .select({ unread: count() })
      .from(patientNotifications)
      .where(and(eq(patientNotifications.patientId, patient.id), isNull(patientNotifications.readAt)));
    return { items, unreadCount: unread };
  }

  async markRead(accountId: string, id: string): Promise<void> {
    const patient = await this.patients.requireProfile(accountId);
    const updated = await this.db
      .update(patientNotifications)
      .set({ readAt: new Date() })
      .where(and(eq(patientNotifications.id, id), eq(patientNotifications.patientId, patient.id), isNull(patientNotifications.readAt)))
      .returning({ id: patientNotifications.id });
    if (updated.length === 0) {
      // Already read, or not theirs: only the latter is an error, and it must look like "not found".
      const [existing] = await this.db
        .select({ id: patientNotifications.id })
        .from(patientNotifications)
        .where(and(eq(patientNotifications.id, id), eq(patientNotifications.patientId, patient.id)));
      if (!existing) throw new NotFoundAppException('Notification');
    }
  }

  async markAllRead(accountId: string): Promise<void> {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return;
    await this.db
      .update(patientNotifications)
      .set({ readAt: new Date() })
      .where(and(eq(patientNotifications.patientId, patient.id), isNull(patientNotifications.readAt)));
  }
}
