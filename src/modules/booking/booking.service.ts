import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, getTableColumns, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { appointments, clinicalServices, patients, providers } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { SchedulingService } from '../scheduling/scheduling.service';
import type { CreateAppointmentDto, ListAppointmentsQueryDto } from './dto/booking.dto';

export type Appointment = typeof appointments.$inferSelect;

/** An appointment row joined with the names `/admin/bookings` shows instead of raw foreign keys. */
export type AdminAppointmentRow = Appointment & {
  patientName: string;
  providerName: string;
  serviceName: string;
  feeKobo: number;
};

const CANCELLABLE_STATUSES: Appointment['status'][] = ['slot_held', 'confirmed'];

/**
 * The appointment lifecycle (blueprint §4.1): `slot_held` → `confirmed`, or → `cancelled` /
 * `doctor_unavailable` / `patient_no_show`. Confirmation is a separate step from creation —
 * booking.service.ts does not decide *when* to confirm; payment.service.ts and
 * authorisation.service.ts call `confirm()` once their own state machine reaches a paid /
 * approved state (blueprint §3.2 — payer convergence rule).
 */
@Injectable()
export class BookingService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly scheduling: SchedulingService,
  ) {}

  /** View 15 — Review Booking & Payment (the appointment is created in `slot_held` state here). */
  async create(input: CreateAppointmentDto): Promise<Appointment> {
    // Re-asserts the hold; throws SLOT_UNAVAILABLE if it has expired or was taken meanwhile.
    await this.scheduling.holdSlot(input.availabilitySlotId);

    const [appointment] = await this.db
      .insert(appointments)
      .values({ ...input, status: 'slot_held' })
      .returning();

    return appointment;
  }

  async getById(id: string): Promise<Appointment> {
    const [appointment] = await this.db.select().from(appointments).where(eq(appointments.id, id));
    if (!appointment) throw new NotFoundAppException('Appointment');
    return appointment;
  }

  /** `/admin/bookings` — the "Bookings" page in the operations console. */
  async adminList(query: ListAppointmentsQueryDto): Promise<PaginatedResult<AdminAppointmentRow>> {
    const conditions = [];
    if (query.status) conditions.push(eq(appointments.status, query.status));
    if (query.patientId) conditions.push(eq(appointments.patientId, query.patientId));
    if (query.providerId) conditions.push(eq(appointments.providerId, query.providerId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(appointments).where(where);
    const items = await this.db
      .select({
        ...getTableColumns(appointments),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        providerName: providers.displayName,
        serviceName: clinicalServices.name,
        feeKobo: clinicalServices.basePriceKobo,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(providers, eq(appointments.providerId, providers.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .where(where)
      .orderBy(desc(appointments.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  /** View 17 — Booking Confirmation. Called once payment succeeds or HMO authorisation is approved. */
  async confirm(id: string, authorisationId?: string): Promise<Appointment> {
    const appointment = await this.getById(id);
    if (appointment.status !== 'slot_held') {
      throw new AppException('BOOKING_NOT_HOLDABLE', `This booking cannot be confirmed from its current state (${appointment.status}).`, 409);
    }

    await this.scheduling.markBooked(appointment.availabilitySlotId);

    const [updated] = await this.db
      .update(appointments)
      .set({ status: 'confirmed', authorisationId, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    return updated;
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.getById(id);
    if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
      throw new AppException('BOOKING_NOT_CANCELLABLE', `This booking cannot be cancelled from its current state (${appointment.status}).`, 409);
    }

    await this.scheduling.release(appointment.availabilitySlotId);

    const [updated] = await this.db
      .update(appointments)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    return updated;
  }
}
