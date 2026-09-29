import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, lt, or } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { availabilitySlots } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import type { CreateSlotDto } from './dto/scheduling.dto';

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;

const HOLD_MINUTES = 10;

@Injectable()
export class SchedulingService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listAvailable(providerId: string): Promise<AvailabilitySlot[]> {
    const now = new Date();
    return this.db
      .select()
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.providerId, providerId),
          eq(availabilitySlots.isBooked, false),
          gt(availabilitySlots.startsAt, now),
          or(isNull(availabilitySlots.heldUntil), lt(availabilitySlots.heldUntil, now)),
        ),
      );
  }

  async createSlot(input: CreateSlotDto): Promise<AvailabilitySlot> {
    const [slot] = await this.db
      .insert(availabilitySlots)
      .values({ providerId: input.providerId, startsAt: new Date(input.startsAt), durationMinutes: input.durationMinutes })
      .returning();
    return slot;
  }

  /**
   * Booking state 1/2 — "slot held" (blueprint §4.1). A single conditional UPDATE is the whole
   * concurrency guard: Postgres' row lock means two simultaneous holds on the same slot can't
   * both succeed, no separate application-level lock needed.
   */
  async holdSlot(slotId: string): Promise<AvailabilitySlot> {
    const now = new Date();
    const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60_000);

    const [slot] = await this.db
      .update(availabilitySlots)
      .set({ heldUntil })
      .where(
        and(
          eq(availabilitySlots.id, slotId),
          eq(availabilitySlots.isBooked, false),
          or(isNull(availabilitySlots.heldUntil), lt(availabilitySlots.heldUntil, now)),
        ),
      )
      .returning();

    if (!slot) {
      const [exists] = await this.db.select().from(availabilitySlots).where(eq(availabilitySlots.id, slotId));
      if (!exists) throw new NotFoundAppException('Availability slot');
      throw new AppException('SLOT_UNAVAILABLE', 'This time is no longer available. Please choose another.', 409);
    }

    return slot;
  }

  /** Booking state 2/2, called by BookingService once an appointment is confirmed for this slot. */
  async markBooked(slotId: string): Promise<void> {
    await this.db.update(availabilitySlots).set({ isBooked: true, heldUntil: null }).where(eq(availabilitySlots.id, slotId));
  }

  async release(slotId: string): Promise<void> {
    await this.db.update(availabilitySlots).set({ heldUntil: null }).where(eq(availabilitySlots.id, slotId));
  }
}
