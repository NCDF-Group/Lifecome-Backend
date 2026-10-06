import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, getTableColumns, gte, lt, sql } from 'drizzle-orm';

import { paginate, type PaginatedResult } from '../../common/dto/pagination.dto';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { DRIZZLE, type Database } from '../../db/client';
import { appointments, availabilitySlots, clinicalServices, patients, providers, staffAccounts } from '../../db/schema';
import type { ClinicianAppointmentsQueryDto, ClinicianCreateSlotDto } from './dto/clinician.dto';

export type ClinicianAppointmentRow = typeof appointments.$inferSelect & {
  patientName: string;
  serviceName: string;
  startsAt: Date;
  durationMinutes: number;
};

/**
 * The doctor-facing workspace (`/clinician/*`). Everything here is scoped to the provider profile the
 * signed-in clinician account is linked to - looked up from the database on every call rather than
 * trusted from the JWT, so unlinking an account takes effect immediately. A clinician can never name
 * another provider: there is no providerId parameter anywhere in this service.
 */
@Injectable()
export class ClinicianService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** The provider profile for this staff account, or a 403 if the account isn't linked to one. */
  private async providerIdFor(staffId: string): Promise<string> {
    const [account] = await this.db
      .select({ providerId: staffAccounts.providerId, status: staffAccounts.status })
      .from(staffAccounts)
      .where(eq(staffAccounts.id, staffId));
    if (!account || account.status !== 'active' || !account.providerId) {
      throw new AppException('CLINICIAN_NOT_LINKED', 'Your account is not linked to a provider profile. Ask an administrator.', HttpStatus.FORBIDDEN);
    }
    return account.providerId;
  }

  async me(staffId: string) {
    const providerId = await this.providerIdFor(staffId);
    const [provider] = await this.db.select().from(providers).where(eq(providers.id, providerId));
    if (!provider) throw new NotFoundAppException('Provider');
    return { provider };
  }

  async listAppointments(staffId: string, query: ClinicianAppointmentsQueryDto): Promise<PaginatedResult<ClinicianAppointmentRow>> {
    const providerId = await this.providerIdFor(staffId);
    const now = new Date();

    const conditions = [eq(appointments.providerId, providerId)];
    if (query.status) conditions.push(eq(appointments.status, query.status));
    if (query.scope === 'upcoming') conditions.push(gte(availabilitySlots.startsAt, now));
    if (query.scope === 'past') conditions.push(lt(availabilitySlots.startsAt, now));
    const where = and(...conditions);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(appointments)
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .where(where);

    const items = await this.db
      .select({
        ...getTableColumns(appointments),
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        serviceName: clinicalServices.name,
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
      })
      .from(appointments)
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      .where(where)
      .orderBy(query.scope === 'past' ? desc(availabilitySlots.startsAt) : asc(availabilitySlots.startsAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return paginate(items, total, query.page, query.pageSize);
  }

  /** One of this clinician's own appointments, with the patient's basics and the intake answers. */
  async getAppointment(staffId: string, appointmentId: string) {
    const providerId = await this.providerIdFor(staffId);
    const [row] = await this.db
      .select({
        ...getTableColumns(appointments),
        startsAt: availabilitySlots.startsAt,
        durationMinutes: availabilitySlots.durationMinutes,
        serviceName: clinicalServices.name,
        patient: {
          id: patients.id,
          firstName: patients.firstName,
          lastName: patients.lastName,
          dateOfBirth: patients.dateOfBirth,
          sex: patients.sex,
          city: patients.city,
          state: patients.state,
        },
      })
      .from(appointments)
      .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
      // Someone else's appointment is indistinguishable from one that doesn't exist.
      .where(and(eq(appointments.id, appointmentId), eq(appointments.providerId, providerId)));
    if (!row) throw new NotFoundAppException('Appointment');
    return row;
  }

  async listSlots(staffId: string) {
    const providerId = await this.providerIdFor(staffId);
    return this.db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.providerId, providerId), gte(availabilitySlots.startsAt, new Date())))
      .orderBy(asc(availabilitySlots.startsAt));
  }

  async createSlot(staffId: string, input: ClinicianCreateSlotDto) {
    const providerId = await this.providerIdFor(staffId);
    const startsAt = new Date(input.startsAt);
    if (startsAt.getTime() <= Date.now()) {
      throw new AppException('SLOT_IN_PAST', 'Choose a time in the future.', HttpStatus.BAD_REQUEST);
    }
    const [slot] = await this.db
      .insert(availabilitySlots)
      .values({ providerId, startsAt, durationMinutes: input.durationMinutes })
      .returning();
    return slot;
  }

  /** Only a clinician's own, still-unbooked slots can be removed. */
  async deleteSlot(staffId: string, slotId: string): Promise<void> {
    const providerId = await this.providerIdFor(staffId);
    const [slot] = await this.db
      .select()
      .from(availabilitySlots)
      .where(and(eq(availabilitySlots.id, slotId), eq(availabilitySlots.providerId, providerId)));
    if (!slot) throw new NotFoundAppException('Availability slot');
    if (slot.isBooked) {
      throw new AppException('SLOT_BOOKED', 'This time is already booked and cannot be removed.', HttpStatus.CONFLICT);
    }
    // Referenced by an appointment held but not yet confirmed? Deleting would orphan it.
    const [held] = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(eq(appointments.availabilitySlotId, slotId), eq(appointments.status, 'slot_held')));
    if (held) throw new AppException('SLOT_HELD', 'A patient is booking this time right now.', HttpStatus.CONFLICT);
    await this.db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
  }
}
