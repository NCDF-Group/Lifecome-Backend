import { Injectable } from '@nestjs/common';
import type { ServiceOverviewResponseDto } from './dto/service-hub.dto';

@Injectable()
export class ServiceHubService {
  getOverview(): ServiceOverviewResponseDto {
    return {
      headline: 'Your health. Your life. Connected.',
      supportingText: 'GP appointments, professional care, wellbeing and insurance in one place.',
      services: [
        {
          id: 'gp',
          title: 'GP',
          headline: 'GP services',
          description: 'Online GP, physical clinic appointments and Menopause Care, including HRT assessment and reviews.',
          mainAction: 'Book a GP appointment',
          destinationRoute: '/gp',
          icon: 'stethoscope',
          status: 'ready_for_launch',
          features: [
            'Online GP consultations (video and telephone)',
            'In-person clinic appointments across London and regional centres',
            'Menopause Care: initial assessment, HRT reviews and specialist plans',
            'Seamless clinical prescriptions and follow-up care plans',
          ],
        },
        {
          id: 'care',
          title: 'Care',
          headline: 'Professional care',
          description: 'Professional care services, assessment requests, agreed support plans and scheduled care visits.',
          mainAction: 'Request a care assessment',
          destinationRoute: '/care',
          icon: 'hand-heart',
          status: 'ready_for_launch',
          features: [
            'Assessment requests for yourself or family members',
            'Dedicated care coordinator review and personalised planning',
            'Agreed support plans with verified care providers',
            'Scheduled visiting and personal care with real-time updates',
          ],
        },
        {
          id: 'wellbeing',
          title: 'Wellbeing',
          headline: 'Wellbeing & Shop',
          description: 'Lifestyle coaching, healthy eating education, stress management and relaxation, and the Wellbeing Shop.',
          mainAction: 'Explore sessions or shop',
          destinationRoute: '/wellbeing',
          icon: 'leaf',
          status: 'ready_for_launch',
          features: [
            'Lifestyle and wellbeing coaching sessions',
            'Healthy eating and nutritional education',
            'Stress management and relaxation techniques',
            'Wellbeing Shop: high-quality vitamins, supplements and remedies',
          ],
        },
        {
          id: 'insurance',
          title: 'Insurance',
          headline: 'Insurance service',
          description: 'Explore insurance cover, access policies, check service-specific cover and reach the responsible provider.',
          mainAction: 'Explore cover or view policies',
          destinationRoute: '/insurance',
          icon: 'shield-check',
          status: 'ready_for_launch',
          features: [
            'Explore authorized private health and cash plan covers',
            'Link and verify your existing insurance policies',
            'Instant service-specific cover checks (included, co-pay, pre-auth)',
            'Dedicated claims and provider support contact pathways',
          ],
        },
      ],
      accountActions: {
        createAccount: '/register',
        login: '/login',
      },
    };
  }

  getEmergencyGuidance() {
    return {
      title: 'Need urgent help?',
      subtitle: 'Emergency and immediate assistance guidance',
      advice: 'If someone is seriously ill or injured and their life is at risk, call emergency services immediately.',
      ukContacts: {
        lifeThreatening: {
          number: '999',
          label: 'Emergency Services (Life-threatening conditions)',
          details: 'Call 999 for signs of heart attack, stroke, severe bleeding, or unconsciousness.',
        },
        urgentMedical: {
          number: '111',
          label: 'NHS 111 (Urgent medical guidance)',
          details: 'Call 111 or visit 111.nhs.uk for medical concerns that need fast attention but are not life-threatening.',
        },
        crisisSupport: {
          number: '116 123',
          label: 'Samaritans (Mental health crisis)',
          details: 'Free, confidential mental health and emotional support 24 hours a day, 365 days a year.',
        },
      },
    };
  }
}
