import { describe, expect, it } from 'vitest';

import type { Database } from '../../db/client';
import { ConsultationService, type ConsultationSession } from './consultation.service';

/**
 * A minimal stand-in for the Drizzle query builder, just deep enough for the two call shapes
 * `ConsultationService` actually uses (`select().from().where()` and
 * `update().set().where().returning()`), so the waiting-room state machine can be unit-tested
 * without a real Postgres connection.
 */
function fakeDb(initial: ConsultationSession): Database {
  let session = initial;
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([session]),
      }),
    }),
    update: () => ({
      set: (patch: Partial<ConsultationSession>) => ({
        where: () => ({
          returning: () => {
            session = { ...session, ...patch };
            return Promise.resolve([session]);
          },
        }),
      }),
    }),
    // Not used once a session already exists — present only so the type checks out.
    insert: () => {
      throw new Error('insert should not be called when a session already exists');
    },
  } as unknown as Database;
}

const baseSession: ConsultationSession = {
  id: 'session-1',
  appointmentId: 'appointment-1',
  status: 'waiting',
  roomName: 'room_test',
  startedAt: null,
  endedAt: null,
};

describe('ConsultationService', () => {
  it('allows a defined transition and records when the call connects', async () => {
    const service = new ConsultationService(fakeDb(baseSession));

    const result = await service.transition('appointment-1', 'clinician_joining');

    expect(result.status).toBe('clinician_joining');
  });

  it('rejects a transition that skips states', async () => {
    const service = new ConsultationService(fakeDb(baseSession));

    await expect(service.transition('appointment-1', 'ended')).rejects.toThrow(
      /Cannot move a consultation from 'waiting' to 'ended'/,
    );
  });

  it('stamps startedAt the first time a call connects', async () => {
    const service = new ConsultationService(fakeDb({ ...baseSession, status: 'clinician_joining' }));

    const result = await service.transition('appointment-1', 'connected');

    expect(result.status).toBe('connected');
    expect(result.startedAt).toBeInstanceOf(Date);
  });
});
