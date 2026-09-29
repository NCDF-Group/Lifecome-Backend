import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { consultationStatusEnum } from './enums';
import { appointments } from './booking.schema';

/**
 * RTC session metadata only — never the media itself (no recording by default; blueprint §10).
 * `roomToken` is short-lived and issued per participant, not stored beyond its own lifetime in
 * practice; kept here only as a reference to the last-issued room name for reconnects.
 */
export const consultationSessions = pgTable('consultation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .unique()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  status: consultationStatusEnum('status').notNull().default('booked'),
  roomName: text('room_name'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});
