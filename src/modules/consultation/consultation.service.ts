import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { consultationSessions } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';

export type ConsultationSession = typeof consultationSessions.$inferSelect;
type ConsultationStatus = ConsultationSession['status'];

/**
 * The waiting-room state machine (blueprint §10.1):
 *
 *   BOOKED → CHECK_IN_OPEN → DEVICE_CHECK → WAITING → CLINICIAN_JOINING → CONNECTED → ENDED
 *                            ↘ SUPPORT / RECONNECT / AUDIO_FALLBACK ↗
 *
 * Only the transitions below are legal; anything else throws. No RTC vendor is wired in yet
 * (blueprint §10 / tech-stack-recommendation §9 — an open ⚠ decision), so `roomName` is a
 * placeholder and no participant tokens are issued. When a vendor is chosen, that logic replaces
 * the TODO in `start()` without changing this state machine.
 */
const ALLOWED_TRANSITIONS: Record<ConsultationStatus, ConsultationStatus[]> = {
  booked: ['check_in_open'],
  check_in_open: ['device_check'],
  device_check: ['waiting'],
  waiting: ['clinician_joining', 'reconnecting'],
  clinician_joining: ['connected', 'reconnecting'],
  connected: ['reconnecting', 'audio_fallback', 'ended'],
  reconnecting: ['connected', 'audio_fallback', 'waiting', 'ended'],
  audio_fallback: ['connected', 'ended'],
  ended: [],
};

@Injectable()
export class ConsultationService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getOrCreateForAppointment(appointmentId: string): Promise<ConsultationSession> {
    const [existing] = await this.db
      .select()
      .from(consultationSessions)
      .where(eq(consultationSessions.appointmentId, appointmentId));
    if (existing) return existing;

    // TODO: once an RTC vendor is chosen, create the room with that provider here instead.
    const [created] = await this.db
      .insert(consultationSessions)
      .values({ appointmentId, roomName: `room_${randomUUID()}` })
      .returning();
    return created;
  }

  async transition(appointmentId: string, to: ConsultationStatus): Promise<ConsultationSession> {
    const session = await this.getOrCreateForAppointment(appointmentId);
    const allowed = ALLOWED_TRANSITIONS[session.status];
    if (!allowed.includes(to)) {
      throw new AppException(
        'ILLEGAL_CONSULTATION_TRANSITION',
        `Cannot move a consultation from '${session.status}' to '${to}'.`,
        409,
      );
    }

    const patch: Partial<ConsultationSession> = { status: to };
    if (to === 'connected' && !session.startedAt) patch.startedAt = new Date();
    if (to === 'ended') patch.endedAt = new Date();

    const [updated] = await this.db
      .update(consultationSessions)
      .set(patch)
      .where(eq(consultationSessions.id, session.id))
      .returning();
    if (!updated) throw new NotFoundAppException('Consultation session');
    return updated;
  }
}
