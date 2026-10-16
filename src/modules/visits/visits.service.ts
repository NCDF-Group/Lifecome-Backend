import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import {
  appointments,
  availabilitySlots,
  careArrangements,
  careVisits,
  clinicalServices,
  consultationSessions,
  providers,
  wellbeingSessions,
} from '../../db/schema';
import { PatientService } from '../patient/patient.service';
import type { ListVisitsQueryDto } from './dto/visits.dto';

export interface UnifiedVisitItem {
  id: string;
  service: 'gp' | 'care' | 'wellbeing';
  serviceLabel: string;
  visitType: string;
  title: string;
  scheduledStartsAt: Date;
  durationMinutes: number;
  providerOrWorkerName: string;
  deliveryChannel: 'online' | 'clinic' | 'in_person_home';
  status: string;
  locationDetails: {
    clinicName?: string | null;
    address?: string | null;
    arrivalInstructions?: string | null;
    meetingLink?: string | null;
    roomName?: string | null;
  };
  urgentContactPhone?: string | null;
  viewDetailsRoute: string;
}

@Injectable()
export class VisitsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  async listVisits(accountId: string, query: ListVisitsQueryDto): Promise<{
    visits: UnifiedVisitItem[];
    counts: { total: number; upcoming: number; past: number; gp: number; care: number; wellbeing: number };
  }> {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) {
      return {
        visits: [],
        counts: { total: 0, upcoming: 0, past: 0, gp: 0, care: 0, wellbeing: 0 },
      };
    }

    const now = new Date();
    const results: UnifiedVisitItem[] = [];

    // 1. GP appointments
    if (query.service === 'all' || query.service === 'gp') {
      const appts = await this.db
        .select({
          id: appointments.id,
          status: appointments.status,
          consultationMode: appointments.consultationMode,
          locationCity: appointments.locationCity,
          clinicName: appointments.clinicName,
          clinicAddress: appointments.clinicAddress,
          arrivalInstructions: appointments.arrivalInstructions,
          serviceCategory: appointments.serviceCategory,
          startsAt: availabilitySlots.startsAt,
          durationMinutes: availabilitySlots.durationMinutes,
          providerName: providers.displayName,
          serviceName: clinicalServices.name,
        })
        .from(appointments)
        .innerJoin(providers, eq(appointments.providerId, providers.id))
        .innerJoin(clinicalServices, eq(appointments.clinicalServiceId, clinicalServices.id))
        .innerJoin(availabilitySlots, eq(appointments.availabilitySlotId, availabilitySlots.id))
        .where(eq(appointments.patientId, patient.id))
        .orderBy(desc(availabilitySlots.startsAt));

      for (const a of appts) {
        const isClinic = a.consultationMode === 'in_person';
        let roomName: string | null = null;
        if (!isClinic) {
          const [session] = await this.db
            .select({ roomName: consultationSessions.roomName })
            .from(consultationSessions)
            .where(eq(consultationSessions.appointmentId, a.id));
          roomName = session?.roomName ?? null;
        }

        results.push({
          id: a.id,
          service: 'gp',
          serviceLabel: a.serviceCategory === 'menopause' ? 'Menopause Care' : 'GP Service',
          visitType: isClinic ? 'Clinic appointment' : 'Online GP consultation',
          title: a.serviceName,
          scheduledStartsAt: a.startsAt,
          durationMinutes: a.durationMinutes,
          providerOrWorkerName: a.providerName,
          deliveryChannel: isClinic ? 'clinic' : 'online',
          status: a.status,
          locationDetails: {
            clinicName: a.clinicName,
            address: a.clinicAddress,
            arrivalInstructions: a.arrivalInstructions,
            roomName,
          },
          urgentContactPhone: isClinic ? '+44 20 7946 0100' : null,
          viewDetailsRoute: `/appointments/${a.id}`,
        });
      }
    }

    // 2. Care Visits
    if (query.service === 'all' || query.service === 'care') {
      const cVisits = await this.db
        .select({
          id: careVisits.id,
          careWorkerName: careVisits.careWorkerName,
          serviceType: careVisits.serviceType,
          scheduledStartsAt: careVisits.scheduledStartsAt,
          durationMinutes: careVisits.durationMinutes,
          status: careVisits.status,
          address: careVisits.address,
          postcode: careVisits.postcode,
          urgentContactPhone: careVisits.urgentContactPhone,
          namedProvider: careArrangements.namedProvider,
        })
        .from(careVisits)
        .innerJoin(careArrangements, eq(careVisits.arrangementId, careArrangements.id))
        .where(eq(careVisits.patientId, patient.id))
        .orderBy(desc(careVisits.scheduledStartsAt));

      for (const cv of cVisits) {
        results.push({
          id: cv.id,
          service: 'care',
          serviceLabel: 'Professional Care',
          visitType: 'Scheduled care visit',
          title: cv.serviceType,
          scheduledStartsAt: cv.scheduledStartsAt,
          durationMinutes: cv.durationMinutes,
          providerOrWorkerName: `${cv.careWorkerName} (${cv.namedProvider})`,
          deliveryChannel: 'in_person_home',
          status: cv.status,
          locationDetails: {
            address: `${cv.address}, ${cv.postcode}`,
            arrivalInstructions: 'Caregiver will arrive at your residence at the scheduled start time.',
          },
          urgentContactPhone: cv.urgentContactPhone,
          viewDetailsRoute: `/care/visits/${cv.id}`,
        });
      }
    }

    // 3. Wellbeing Sessions
    if (query.service === 'all' || query.service === 'wellbeing') {
      const wSessions = await this.db
        .select()
        .from(wellbeingSessions)
        .where(eq(wellbeingSessions.patientId, patient.id))
        .orderBy(desc(wellbeingSessions.scheduledAt));

      for (const ws of wSessions) {
        results.push({
          id: ws.id,
          service: 'wellbeing',
          serviceLabel: 'Wellbeing',
          visitType: 'Wellbeing session',
          title: ws.title,
          scheduledStartsAt: ws.scheduledAt,
          durationMinutes: ws.durationMinutes,
          providerOrWorkerName: ws.coachName,
          deliveryChannel: 'online',
          status: ws.status,
          locationDetails: {
            meetingLink: ws.meetingLink,
          },
          urgentContactPhone: null,
          viewDetailsRoute: `/wellbeing/sessions/${ws.id}`,
        });
      }
    }

    // Global counts
    const totalCount = results.length;
    const upcomingCount = results.filter((v) => new Date(v.scheduledStartsAt).getTime() >= now.getTime()).length;
    const pastCount = results.filter((v) => new Date(v.scheduledStartsAt).getTime() < now.getTime()).length;
    const gpCount = results.filter((v) => v.service === 'gp').length;
    const careCount = results.filter((v) => v.service === 'care').length;
    const wellbeingCount = results.filter((v) => v.service === 'wellbeing').length;

    // Filter by timeframe
    let filtered = results;
    if (query.timeframe === 'upcoming') {
      filtered = results.filter((v) => new Date(v.scheduledStartsAt).getTime() >= now.getTime());
      filtered.sort((a, b) => new Date(a.scheduledStartsAt).getTime() - new Date(b.scheduledStartsAt).getTime());
    } else if (query.timeframe === 'past') {
      filtered = results.filter((v) => new Date(v.scheduledStartsAt).getTime() < now.getTime());
      filtered.sort((a, b) => new Date(b.scheduledStartsAt).getTime() - new Date(a.scheduledStartsAt).getTime());
    } else {
      // Sort upcoming soonest, then past latest
      filtered.sort((a, b) => new Date(b.scheduledStartsAt).getTime() - new Date(a.scheduledStartsAt).getTime());
    }

    return {
      visits: filtered,
      counts: {
        total: totalCount,
        upcoming: upcomingCount,
        past: pastCount,
        gp: gpCount,
        care: careCount,
        wellbeing: wellbeingCount,
      },
    };
  }
}
