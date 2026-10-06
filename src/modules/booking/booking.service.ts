import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, getTableColumns, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { DRIZZLE, type Database } from '../../db/client';
import { appointments, availabilitySlots, clinicalServices, patients, providers } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { AppConfigService } from '../../common/config/configuration';
import { SchedulingService } from '../scheduling/scheduling.service';
import { PatientService } from '../patient/patient.service';
import { PatientNotificationsService } from '../patient-notifications/patient-notifications.service';
import type { CreateAppointmentDto, CreateMyAppointmentDto, ListAppointmentsQueryDto } from './dto/booking.dto';

export type Appointment = typeof appointments.$inferSelect;

/** An appointment row joined with the names `/admin/bookings` shows instead of raw foreign keys. */
export type AdminAppointmentRow = Appointment & {
  patientName: string;
  providerName: string;
  serviceName: string;
  feeKobo: number;
};

/** One appointment for the console's booking detail page: the joined names plus when it starts. */
export type AdminAppointmentDetail = AdminAppointmentRow & { startsAt: Date; durationMinutes: number };

/** One of the patient's own appointments, with the names and start time the app shows. */
export type PatientAppointmentRow = Appointment & {
  providerName: string;
  serviceName: string;
  startsAt: Date;
  durationMinutes: number;
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
    private readonly patients: PatientService,
    private readonly config: AppConfigService,
    private readonly notifications: PatientNotificationsService,
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

  // ---- The signed-in patient's own appointments --------------------------------------------

  /** Creates a held appointment for the signed-in patient, after checking the booking makes sense. */
  async createForPatient(accountId: string, input: CreateMyAppointmentDto): Promise<Appointment> {
    const patient = await this.patients.requireProfile(accountId);

    const [slot] = await this.db.select().from(availabilitySlots).where(eq(availabilitySlots.id, input.availabilitySlotId));
    if (!slot) throw new NotFoundAppException('Availability slot');
    if (slot.providerId !== input.providerId) {
      throw new AppException('SLOT_PROVIDER_MISMATCH', 'That time does not belong to this clinician.', HttpStatus.BAD_REQUEST);
    }
    if (slot.startsAt.getTime() <= Date.now()) {
      throw new AppException('SLOT_IN_PAST', 'That time has already passed. Please choose another.', HttpStatus.BAD_REQUEST);
    }

    const [provider] = await this.db.select().from(providers).where(eq(providers.id, input.providerId));
    if (!provider || provider.networkStatus !== 'active') throw new NotFoundAppException('Provider');
    if (!provider.consultationModes.includes(input.consultationMode)) {
      throw new AppException('MODE_NOT_OFFERED', 'This clinician does not offer that type of appointment.', HttpStatus.BAD_REQUEST);
    }

    const [service] = await this.db.select().from(clinicalServices).where(eq(clinicalServices.id, input.clinicalServiceId));
    if (!service || !service.isActive) throw new NotFoundAppException('Clinical service');

    return this.create({ ...input, patientId: patient.id });
  }

  /** The patient's own appointments, soonest-created first. */
  async listForPatient(accountId: string): Promise<PatientAppointmentRow[]> {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select({
        ...getTableColumns(appointments),
        providerName: providers.displayName,
        serviceName: clinicalServices.name,
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
      })
      .from(appointments)
      .innerJoin(providers, eq(appointments.providerId, providers.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .where(eq(appointments.patientId, patient.id))
      .orderBy(desc(availabilitySlots.startsAt));
  }

  /** One appointment, but only if it belongs to this patient - anyone else's looks like it doesn't exist. */
  async getForPatient(accountId: string, id: string): Promise<PatientAppointmentRow> {
    const patient = await this.patients.requireProfile(accountId);
    const [row] = await this.db
      .select({
        ...getTableColumns(appointments),
        providerName: providers.displayName,
        serviceName: clinicalServices.name,
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
      })
      .from(appointments)
      .innerJoin(providers, eq(appointments.providerId, providers.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .where(and(eq(appointments.id, id), eq(appointments.patientId, patient.id)));
    if (!row) throw new NotFoundAppException('Appointment');
    return row;
  }

  /** The patient confirming their own held booking - only while `ALLOW_SELF_CONFIRM_BOOKINGS` is on. */
  async confirmForPatient(accountId: string, id: string): Promise<Appointment> {
    if (!this.config.allowSelfConfirmBookings) {
      throw new AppException('PAYMENT_REQUIRED', 'This booking is confirmed once payment or authorisation completes.', HttpStatus.FORBIDDEN);
    }
    await this.getForPatient(accountId, id);
    return this.confirm(id);
  }

  async cancelForPatient(accountId: string, id: string): Promise<Appointment> {
    await this.getForPatient(accountId, id);
    return this.cancel(id);
  }

  async getById(id: string): Promise<Appointment> {
    const [appointment] = await this.db.select().from(appointments).where(eq(appointments.id, id));
    if (!appointment) throw new NotFoundAppException('Appointment');
    return appointment;
  }

  /** `/admin/bookings/:id` — the booking detail page. */
  async adminGet(id: string): Promise<AdminAppointmentDetail> {
    const [row] = await this.db
      .select({
        ...getTableColumns(appointments),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        providerName: providers.displayName,
        serviceName: clinicalServices.name,
        feeKobo: clinicalServices.basePriceKobo,
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(providers, eq(appointments.providerId, providers.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .where(eq(appointments.id, id));
    if (!row) throw new NotFoundAppException('Appointment');
    return row;
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

    await this.notifyPatient(updated, 'confirmed');
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

    await this.notifyPatient(updated, 'cancelled');
    return updated;
  }

  /** Tells the patient (in their notification feed) that their booking was confirmed or cancelled. */
  private async notifyPatient(appointment: Appointment, change: 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const [row] = await this.db
        .select({ providerName: providers.displayName, startsAt: availabilitySlots.startsAt, country: patients.country })
        .from(appointments)
        .innerJoin(providers, eq(appointments.providerId, providers.id))
        .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(eq(appointments.id, appointment.id));
      if (!row) return;

      const timeZone = row.country === 'GB' ? 'Europe/London' : 'Africa/Lagos';
      const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(row.startsAt);
      const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(row.startsAt);

      await this.notifications.notify({
        patientId: appointment.patientId,
        kind: 'booking',
        body:
          change === 'confirmed'
            ? `Your booking with ${row.providerName} has been confirmed for ${day} at ${clock}.`
            : `Your booking with ${row.providerName} on ${day} at ${clock} has been cancelled.`,
        highlights: [row.providerName, day],
        actionLabel: 'View Booking',
        actionTarget: 'booking',
        actionRef: appointment.id,
      });
    } catch {
      // A notification is a courtesy - never let it undo the booking change.
    }
  }
}
