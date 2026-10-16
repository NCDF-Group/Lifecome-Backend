import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { menopauseAssessments, operatingClinics } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import type { BookTreatmentReviewDto, MenopauseAssessmentDto } from './dto/gp.dto';

const DEFAULT_CLINICS = [
  {
    name: 'LifeCome Harley Street Clinic',
    city: 'London',
    address: '10 Harley Street, Marylebone',
    postcode: 'W1G 9QD',
    phone: '+44 20 7946 0100',
    accessibilityDetails: 'Full step-free wheelchair access, accessible restrooms, and induction hearing loop.',
    directions: '5-minute walk from Oxford Circus or Bond Street Underground stations.',
    arrivalInstructions: 'Please check in with the 1st floor LifeCome reception 10 minutes prior to your appointment time.',
    isActive: true,
  },
  {
    name: 'LifeCome Central London Clinic',
    city: 'London',
    address: '14 Pancras Square, King’s Cross',
    postcode: 'N1C 4AG',
    phone: '+44 20 7946 0122',
    accessibilityDetails: 'Ground-floor access, automatic doors, wide consultation suites, and sensory-friendly waiting areas.',
    directions: 'Located directly adjacent to King’s Cross St Pancras International station entrance.',
    arrivalInstructions: 'Present your booking confirmation barcode at the reception desk for instant check-in.',
    isActive: true,
  },
  {
    name: 'LifeCome Birmingham Health Hub',
    city: 'Birmingham',
    address: '45 Colmore Row, City Centre',
    postcode: 'B3 2QD',
    phone: '+44 121 496 0200',
    accessibilityDetails: 'Lift access to 3rd floor, wheelchair friendly, accessible parking bays nearby.',
    directions: '3-minute walk from Birmingham Snow Hill Station; 7 minutes from Birmingham New Street.',
    arrivalInstructions: 'Take the main building lift to Floor 3, suite 302. Complimentary tea and quiet area available.',
    isActive: true,
  },
  {
    name: 'LifeCome Manchester Deansgate Clinic',
    city: 'Manchester',
    address: '180 Deansgate',
    postcode: 'M3 3LY',
    phone: '+44 161 496 0300',
    accessibilityDetails: 'Ground level clinic, full DDA compliance, assistance animals welcomed.',
    directions: '5-minute walk from Manchester Victoria station; Metrolink stop at Exchange Square.',
    arrivalInstructions: 'Ring bell marked LifeCome Live at entrance. Our clinic coordinator will guide you in.',
    isActive: true,
  },
];

@Injectable()
export class GpService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  getHub() {
    return {
      title: 'GP services',
      supportingText: 'Appointments online and in person.',
      sections: [
        {
          id: 'online-gp',
          title: 'Online GP',
          description: 'Book a video or telephone appointment with a GMC-registered GP.',
          channel: 'online',
          modes: ['video', 'audio'],
          actionText: 'Book online appointment',
          route: '/gp/book?mode=online',
        },
        {
          id: 'clinic-appointments',
          title: 'Clinic appointments',
          description: 'Choose a verified operating clinic and in-person appointment slot.',
          channel: 'clinic',
          modes: ['in_person'],
          actionText: 'Choose a clinic',
          route: '/gp/clinics',
        },
        {
          id: 'menopause-care',
          title: 'Menopause Care',
          description: 'Assessment, treatment options and reviews with women’s health specialists.',
          channel: 'both',
          actionText: 'Explore Menopause Care',
          route: '/gp/menopause',
        },
        {
          id: 'clinical-care-plan',
          title: 'My clinical care plan',
          description: 'Access treatment summaries, signed clinical notes and prescription history.',
          actionText: 'View clinical care plan',
          route: '/records/care-plans',
        },
      ],
      quickAction: {
        title: 'Book a GP appointment',
        route: '/gp/book',
      },
    };
  }

  async listClinics() {
    const existing = await this.db.select().from(operatingClinics).where(eq(operatingClinics.isActive, true));
    if (existing.length === 0) {
      // Seed default clinics if empty
      const inserted = await this.db.insert(operatingClinics).values(DEFAULT_CLINICS).returning();
      return inserted;
    }
    return existing;
  }

  async getClinicById(id: string) {
    const [clinic] = await this.db.select().from(operatingClinics).where(eq(operatingClinics.id, id));
    if (!clinic) throw new NotFoundAppException('Operating clinic');
    return clinic;
  }

  getMenopauseOverview() {
    return {
      headline: 'Menopause care, centred on you.',
      subhead: 'Assessment, treatment options and ongoing support',
      description:
        'Personalised clinical guidance from women’s health specialists. Initial assessment, evidence-based HRT management, lifestyle support, and routine treatment reviews all in one place.',
      pathways: [
        {
          title: 'Start assessment',
          description: 'Complete our approved clinical questionnaire for tailored clinician review.',
          route: '/gp/menopause/assessment',
          isNewPatientRoute: true,
        },
        {
          title: 'Book a treatment review',
          description: 'For existing patients reviewing current HRT prescriptions or ongoing symptoms.',
          route: '/gp/menopause/review',
          isReviewRoute: true,
        },
      ],
      clinicalAssurance:
        'All HRT and prescription medicines remain subject to clinical assessment and are dispensed via our licensed pharmacy partner pathway, strictly separate from retail products.',
    };
  }

  async submitMenopauseAssessment(accountId: string, input: MenopauseAssessmentDto) {
    const patient = await this.patients.requireProfile(accountId);
    const [assessment] = await this.db
      .insert(menopauseAssessments)
      .values({
        patientId: patient.id,
        symptoms: input.symptoms,
        hrtHistory: input.hrtHistory ?? null,
        medicalHistory: input.medicalHistory ?? null,
        currentMedications: input.currentMedications ?? null,
        goals: input.goals ?? null,
        status: 'submitted',
      })
      .returning();

    return {
      ...assessment,
      nextStep: 'A women’s health doctor will review your assessment within 24 hours to determine suitable treatment options.',
    };
  }

  async listMenopauseAssessments(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(menopauseAssessments)
      .where(eq(menopauseAssessments.patientId, patient.id))
      .orderBy(desc(menopauseAssessments.createdAt));
  }

  async getMenopauseAssessment(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [assessment] = await this.db
      .select()
      .from(menopauseAssessments)
      .where(and(eq(menopauseAssessments.id, id), eq(menopauseAssessments.patientId, patient.id)));
    if (!assessment) throw new NotFoundAppException('Menopause assessment');
    return assessment;
  }

  async bookTreatmentReview(accountId: string, input: BookTreatmentReviewDto) {
    const patient = await this.patients.requireProfile(accountId);
    if (input.assessmentId) {
      await this.getMenopauseAssessment(accountId, input.assessmentId);
    }
    return {
      reviewRequestId: `MRV-${Date.now().toString(36).toUpperCase()}`,
      patientId: patient.id,
      preferredChannel: input.preferredChannel,
      clinicId: input.clinicId ?? null,
      status: 'review_requested',
      message: 'Treatment review requested. Clinician slots matching your preferences have been prioritized.',
    };
  }
}
