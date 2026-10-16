import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

import { DRIZZLE, type Database } from '../../db/client';
import { careArrangements, careAssessmentRequests, careUrgentReports, careVisits } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import type {
  CancelCareVisitDto,
  CareAssessmentRequestDto,
  CareUrgentReportDto,
  ChangeCareVisitDto,
  RequestChangeCareArrangementDto,
} from './dto/care.dto';

const nanoidRef = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

const CARE_CATALOGUE = [
  {
    id: 'visiting-care',
    code: 'VISITING_CARE',
    name: 'Visiting Care',
    category: 'Daily Living',
    description: 'Scheduled visits from 30 minutes to multiple hours to assist with daily routines and independence at home.',
    hourlyRatePence: 2400,
    hourlyRateFormatted: '£24.00/hour',
  },
  {
    id: 'personal-care',
    code: 'PERSONAL_CARE',
    name: 'Personal Care & Hygiene',
    category: 'Clinical & Daily Living',
    description: 'Dignified, professional assistance with bathing, dressing, medication prompting, and personal hygiene.',
    hourlyRatePence: 2650,
    hourlyRateFormatted: '£26.50/hour',
  },
  {
    id: 'companionship-support',
    code: 'COMPANIONSHIP',
    name: 'Companionship & Wellbeing',
    category: 'Social Support',
    description: 'Warm company, social engagement, meal accompaniment, and assisted outings to keep you active.',
    hourlyRatePence: 2200,
    hourlyRateFormatted: '£22.00/hour',
  },
  {
    id: 'respite-care',
    code: 'RESPITE_CARE',
    name: 'Respite Care Support',
    category: 'Specialist',
    description: 'Flexible short-term relief care giving primary family carers essential peace of mind and time to rest.',
    hourlyRatePence: 2800,
    hourlyRateFormatted: '£28.00/hour',
  },
  {
    id: 'overnight-care',
    code: 'OVERNIGHT_CARE',
    name: 'Overnight Care & Reassurance',
    category: 'Night Support',
    description: 'Dedicated waking night or sleep-in care ensuring safety, reassurance, and continuous assistance through the night.',
    hourlyRatePence: 3000,
    hourlyRateFormatted: '£30.00/hour',
  },
];

@Injectable()
export class CareService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  async getOverview(accountId?: string) {
    let activeArrangementsCount = 0;
    let scheduledVisitsCount = 0;

    if (accountId) {
      const patient = await this.patients.getByUserAccountId(accountId);
      if (patient) {
        const arrangements = await this.db
          .select()
          .from(careArrangements)
          .where(and(eq(careArrangements.patientId, patient.id), eq(careArrangements.status, 'active')));
        activeArrangementsCount = arrangements.length;

        const visits = await this.db
          .select()
          .from(careVisits)
          .where(and(eq(careVisits.patientId, patient.id), eq(careVisits.status, 'scheduled')));
        scheduledVisitsCount = visits.length;
      }
    }

    return {
      title: 'Professional care',
      headline: 'Arrange support around your needs',
      description:
        'Person-centred home care delivered by vetted, trained care professionals. From assistance with morning routines to specialist dementia and respite support.',
      providerClarity: {
        legalOrganisation: 'LifeCome Care Services UK Ltd',
        registrationScope: 'Regulated personal care provider in England (CQC registered).',
        operatingAreas: 'Greater London, West Midlands, and Greater Manchester regions.',
      },
      howAssessmentWorks: [
        {
          step: 1,
          title: 'Request a care assessment',
          summary: 'Tell us who requires support, location, and the nature of assistance requested.',
        },
        {
          step: 2,
          title: 'Consultation & home assessment',
          summary: 'Our registered care manager arranges an in-person assessment to co-design your care plan.',
        },
        {
          step: 3,
          title: 'Agreed care arrangements',
          summary: 'Review and confirm your transparent schedule, costs, and designated care team before visits commence.',
        },
      ],
      activeArrangementsCount,
      scheduledVisitsCount,
      quickActions: [
        { title: 'Request a care assessment', route: '/care/assessment/request' },
        { title: 'My care arrangements', route: '/care/arrangements' },
        { title: 'Scheduled care visits', route: '/care/visits' },
        { title: 'Contact care team', route: '/care/contact' },
      ],
    };
  }

  getServicesCatalogue() {
    return {
      provider: 'LifeCome Care Services UK Ltd',
      services: CARE_CATALOGUE,
    };
  }

  async createAssessmentRequest(accountId: string, input: CareAssessmentRequestDto) {
    const patient = await this.patients.requireProfile(accountId);

    if (input.forWhom === 'someone_else' && !input.authorityEstablished) {
      // Still accepted as an inquiry, but explicit notice returned
    }

    const reference = `CARE-REQ-${nanoidRef()}`;
    const [request] = await this.db
      .insert(careAssessmentRequests)
      .values({
        patientId: patient.id,
        reference,
        forWhom: input.forWhom,
        recipientName: input.recipientName ?? null,
        recipientRelationship: input.recipientRelationship ?? null,
        authorityEstablished: input.authorityEstablished,
        postcode: input.postcode,
        supportRequested: input.supportRequested,
        preferredContactMethod: input.preferredContactMethod,
        preferredContactTimes: input.preferredContactTimes ?? null,
        accessibilityNeeds: input.accessibilityNeeds ?? null,
        additionalNotes: input.additionalNotes ?? null,
        status: 'submitted',
      })
      .returning();

    return {
      ...request,
      notice: 'Assessment request submitted successfully. A care coordinator will contact you to review your request.',
    };
  }

  async listAssessmentRequests(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(careAssessmentRequests)
      .where(eq(careAssessmentRequests.patientId, patient.id))
      .orderBy(desc(careAssessmentRequests.createdAt));
  }

  async getAssessmentRequest(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [request] = await this.db
      .select()
      .from(careAssessmentRequests)
      .where(and(eq(careAssessmentRequests.id, id), eq(careAssessmentRequests.patientId, patient.id)));
    if (!request) throw new NotFoundAppException('Care assessment request');

    // Only expose scheduledAssessmentAt if confirmed
    const isConfirmedScheduled = ['assessment_scheduled', 'completed'].includes(request.status);
    return {
      ...request,
      scheduledAssessmentAt: isConfirmedScheduled ? request.scheduledAssessmentAt : null,
      statusLabel: this.formatRequestStatus(request.status),
    };
  }

  async cancelAssessmentRequest(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [request] = await this.db
      .select()
      .from(careAssessmentRequests)
      .where(and(eq(careAssessmentRequests.id, id), eq(careAssessmentRequests.patientId, patient.id)));
    if (!request) throw new NotFoundAppException('Care assessment request');

    if (['completed', 'cancelled'].includes(request.status)) {
      throw new AppException('REQUEST_NOT_CANCELLABLE', `This request is already ${request.status}.`, HttpStatus.CONFLICT);
    }

    const [updated] = await this.db
      .update(careAssessmentRequests)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(careAssessmentRequests.id, id))
      .returning();

    return updated;
  }

  async listArrangements(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(careArrangements)
      .where(eq(careArrangements.patientId, patient.id))
      .orderBy(desc(careArrangements.createdAt));
  }

  async getArrangement(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [arrangement] = await this.db
      .select()
      .from(careArrangements)
      .where(and(eq(careArrangements.id, id), eq(careArrangements.patientId, patient.id)));
    if (!arrangement) throw new NotFoundAppException('Care arrangement');

    // Fetch visits under this arrangement
    const visits = await this.db
      .select()
      .from(careVisits)
      .where(eq(careVisits.arrangementId, arrangement.id))
      .orderBy(desc(careVisits.scheduledStartsAt));

    return {
      ...arrangement,
      visits,
    };
  }

  async requestChangeArrangement(accountId: string, id: string, input: RequestChangeCareArrangementDto) {
    const arrangement = await this.getArrangement(accountId, id);
    return {
      ticketNumber: `CHG-${nanoidRef()}`,
      arrangementId: arrangement.id,
      planReference: arrangement.planReference,
      status: 'change_request_submitted',
      message: 'Your change request has been submitted to the care coordination team. A care coordinator will review and confirm within 24 hours.',
      requestedChange: input,
    };
  }

  async listVisits(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(careVisits)
      .where(eq(careVisits.patientId, patient.id))
      .orderBy(desc(careVisits.scheduledStartsAt));
  }

  async cancelVisit(accountId: string, id: string, input: CancelCareVisitDto) {
    const patient = await this.patients.requireProfile(accountId);
    const [visit] = await this.db
      .select()
      .from(careVisits)
      .where(and(eq(careVisits.id, id), eq(careVisits.patientId, patient.id)));
    if (!visit) throw new NotFoundAppException('Care visit');

    if (visit.status === 'completed' || visit.status === 'cancelled') {
      throw new AppException('VISIT_NOT_CANCELLABLE', `This visit is already ${visit.status}.`, HttpStatus.CONFLICT);
    }

    const [updated] = await this.db
      .update(careVisits)
      .set({ status: 'cancelled', notes: `Cancelled by patient: ${input.reason}`, updatedAt: new Date() })
      .where(eq(careVisits.id, id))
      .returning();

    return {
      ...updated,
      cancellationPolicyNotice: 'Visit cancelled. Notice given more than 24 hours in advance incurs no cancellation charge.',
    };
  }

  async changeVisit(accountId: string, id: string, input: ChangeCareVisitDto) {
    const patient = await this.patients.requireProfile(accountId);
    const [visit] = await this.db
      .select()
      .from(careVisits)
      .where(and(eq(careVisits.id, id), eq(careVisits.patientId, patient.id)));
    if (!visit) throw new NotFoundAppException('Care visit');

    return {
      ticketNumber: `VST-CHG-${nanoidRef()}`,
      visitId: visit.id,
      currentStartsAt: visit.scheduledStartsAt,
      requestedStartsAt: input.requestedDate,
      status: 'reschedule_pending_provider_confirmation',
      message: 'Visit rescheduling request received. Our care coordinator will confirm availability with your care team.',
    };
  }

  async reportUrgentIssue(accountId: string, input: CareUrgentReportDto) {
    const patient = await this.patients.requireProfile(accountId);
    const [report] = await this.db
      .insert(careUrgentReports)
      .values({
        patientId: patient.id,
        visitId: input.visitId ?? null,
        issueType: input.issueType,
        description: input.description,
        status: 'reported',
      })
      .returning();

    return {
      ...report,
      urgentHelpline: '+44 20 7946 0999',
      confirmation: 'Urgent operational notification received. On-call care manager notified immediately.',
    };
  }

  private formatRequestStatus(status: string): string {
    const map: Record<string, string> = {
      submitted: 'Submitted - Pending Coordinator Review',
      under_review: 'Under Review by Care Management',
      assessment_scheduled: 'Assessment Scheduled',
      completed: 'Assessment Completed & Support Plan Agreed',
      cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }
}
