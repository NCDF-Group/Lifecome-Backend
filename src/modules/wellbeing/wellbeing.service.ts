import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { shopOrders, wellbeingSessions } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import type { BookWellbeingSessionDto } from './dto/wellbeing.dto';

const WELLBEING_CATALOGUE = [
  {
    id: 'lifestyle-coaching',
    sessionType: 'lifestyle_coaching',
    title: 'Lifestyle and Wellbeing Coaching',
    headline: 'Practical support for everyday wellbeing',
    description: 'One-to-one coaching on sleep hygiene, physical activity routines, work-life balance, and building sustainable health habits.',
    durationMinutes: 45,
    pricePence: 4500,
    priceFormatted: '£45.00',
    availableCoaches: ['Sarah Jenkins, DipBC', 'Marcus Vance, Certified Wellness Coach'],
  },
  {
    id: 'healthy-eating',
    sessionType: 'healthy_eating',
    title: 'Healthy Eating Education',
    headline: 'Evidence-informed dietary guidance',
    description: 'Learn about balanced macronutrients, whole-food dietary patterns, label reading, and meal planning for energy and longevity.',
    durationMinutes: 45,
    pricePence: 4500,
    priceFormatted: '£45.00',
    availableCoaches: ['Elena Rostova, Registered Nutritional Therapist', 'David Adeleke, ANutr'],
  },
  {
    id: 'stress-management',
    sessionType: 'stress_management',
    title: 'Stress Management and Relaxation',
    headline: 'Tools and techniques to feel better',
    description: 'Guided breathwork, progressive muscle relaxation, mindfulness practices, and nervous system regulation strategies.',
    durationMinutes: 45,
    pricePence: 4000,
    priceFormatted: '£40.00',
    availableCoaches: ['Maya Patel, Mindfulness Instructor', 'Marcus Vance, Certified Wellness Coach'],
  },
];

@Injectable()
export class WellbeingService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  async getHub(accountId?: string) {
    let bookedSessionsCount = 0;
    let pastOrdersCount = 0;

    if (accountId) {
      const patient = await this.patients.getByUserAccountId(accountId);
      if (patient) {
        const sessions = await this.db
          .select()
          .from(wellbeingSessions)
          .where(and(eq(wellbeingSessions.patientId, patient.id), eq(wellbeingSessions.status, 'booked')));
        bookedSessionsCount = sessions.length;

        const orders = await this.db
          .select()
          .from(shopOrders)
          .where(eq(shopOrders.patientId, patient.id));
        pastOrdersCount = orders.length;
      }
    }

    return {
      title: 'Wellbeing',
      supportingText: 'Practical support for everyday wellbeing.',
      services: [
        {
          id: 'lifestyle-coaching',
          title: 'Lifestyle coaching',
          subtitle: 'Get practical support for a healthier you.',
          actionText: 'Explore sessions',
          route: '/wellbeing/sessions/lifestyle-coaching',
        },
        {
          id: 'healthy-eating',
          title: 'Healthy eating education',
          subtitle: 'Learn about balanced eating and nutrition.',
          actionText: 'Explore sessions',
          route: '/wellbeing/sessions/healthy-eating',
        },
        {
          id: 'stress-management',
          title: 'Stress management & relaxation',
          subtitle: 'Tools and techniques to feel better.',
          actionText: 'Explore sessions',
          route: '/wellbeing/sessions/stress-management',
        },
        {
          id: 'wellbeing-shop',
          title: 'Wellbeing Shop',
          subtitle: 'Herbal remedies & supplements.',
          actionText: 'Browse products',
          route: '/shop',
        },
      ],
      userActivity: {
        bookedSessionsCount,
        pastOrdersCount,
        mySessionsRoute: '/me/visits?service=wellbeing',
        myShopOrdersRoute: '/me/shop/orders',
      },
    };
  }

  getSessionCatalogue() {
    return WELLBEING_CATALOGUE;
  }

  async bookSession(accountId: string, input: BookWellbeingSessionDto) {
    const patient = await this.patients.requireProfile(accountId);

    const match = WELLBEING_CATALOGUE.find((s) => s.sessionType === input.sessionType);
    const title = match?.title ?? 'Wellbeing Session';
    const coachName = input.coachName ?? match?.availableCoaches[0] ?? 'LifeCome Wellbeing Coach';

    const scheduledDate = new Date(input.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppException('INVALID_DATE', 'The scheduled date is invalid.', HttpStatus.BAD_REQUEST);
    }
    if (scheduledDate.getTime() <= Date.now()) {
      throw new AppException('SLOT_IN_PAST', 'Session date and time must be in the future.', HttpStatus.BAD_REQUEST);
    }

    const [session] = await this.db
      .insert(wellbeingSessions)
      .values({
        patientId: patient.id,
        sessionType: input.sessionType,
        title,
        coachName,
        scheduledAt: scheduledDate,
        durationMinutes: input.durationMinutes,
        status: 'booked',
        notes: input.notes ?? null,
        meetingLink: `https://meet.lifecome.co.uk/wellbeing/${Date.now().toString(36)}`,
      })
      .returning();

    return {
      ...session,
      message: 'Wellbeing session booked successfully. This session will appear in your Visits calendar.',
    };
  }

  async listMySessions(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(wellbeingSessions)
      .where(eq(wellbeingSessions.patientId, patient.id))
      .orderBy(desc(wellbeingSessions.scheduledAt));
  }

  async cancelSession(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [session] = await this.db
      .select()
      .from(wellbeingSessions)
      .where(and(eq(wellbeingSessions.id, id), eq(wellbeingSessions.patientId, patient.id)));
    if (!session) throw new NotFoundAppException('Wellbeing session');

    if (session.status === 'cancelled' || session.status === 'completed') {
      throw new AppException('SESSION_NOT_CANCELLABLE', `This session is already ${session.status}.`, HttpStatus.CONFLICT);
    }

    const [updated] = await this.db
      .update(wellbeingSessions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(wellbeingSessions.id, id))
      .returning();

    return updated;
  }
}
