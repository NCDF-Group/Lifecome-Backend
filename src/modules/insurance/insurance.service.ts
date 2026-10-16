import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

import { DRIZZLE, type Database } from '../../db/client';
import { insuranceCoverChecks, insurancePolicies, insuranceProducts } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import type {
  CheckServiceCoverDto,
  LinkInsurancePolicyDto,
  RequestInsuranceQuoteDto,
} from './dto/insurance.dto';

const nanoidPolicy = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

const DEFAULT_INSURANCE_PRODUCTS = [
  {
    code: 'LC-ESSENTIAL-HEALTH',
    name: 'LifeCome Essential Health Cover',
    insurerName: 'AXA PPP healthcare Limited (trading as AXA Health)',
    distributorDetails: 'Arranged by LifeCome Live as an appointed representative. Underwritten by AXA Health.',
    summary: 'Fast-track access to private GP consultations, diagnostics, and specialist outpatient consultations across the UK.',
    benefits: [
      'Unlimited virtual GP consultations and priority in-person clinic appointments',
      'Up to £1,500 annual outpatient specialist and diagnostic coverage',
      'Specialist menopause assessment and ongoing hormonal monitoring',
      'Direct-settlement prescriptions with accredited pharmacy partners',
    ],
    exclusions: [
      'Pre-existing chronic conditions diagnosed in the prior 24 months',
      'Cosmetic or aesthetic procedures without functional impairment',
      'Emergency accident and trauma care (treated by NHS A&E)',
    ],
    eligibilityCriteria: 'UK residents aged 18 to 74 years old. Non-smokers and smokers eligible with varied premium.',
    monthlyPremiumEstimate: 'From £34.50/month',
    policyDocumentUrl: 'https://lifecome.co.uk/docs/insurance/essential-health-policy.pdf',
    isActive: true,
  },
  {
    code: 'LC-COMPREHENSIVE-CARE',
    name: 'LifeCome Comprehensive Care Plus',
    insurerName: 'Bupa Insurance Limited',
    distributorDetails: 'Arranged and administered by LifeCome Live. Underwritten by Bupa Insurance Limited.',
    summary: 'Full private healthcare cover including in-patient surgery, cancer care, mental health support, and integrated home care allowances.',
    benefits: [
      'Complete private hospital in-patient and day-patient surgical care',
      'Comprehensive cancer pathway from diagnosis through recovery',
      'Post-operative professional visiting care support (up to 40 hours per episode)',
      'Mental wellbeing consultations and structured psychotherapy pathways',
    ],
    exclusions: [
      'Chronic ongoing management of pre-existing known illnesses prior to inception',
      'Organ transplants and high-risk extreme sports injuries',
    ],
    eligibilityCriteria: 'UK residents aged 18 to 80 years old. Medical history declaration required at application.',
    monthlyPremiumEstimate: 'From £78.00/month',
    policyDocumentUrl: 'https://lifecome.co.uk/docs/insurance/comprehensive-care-plus.pdf',
    isActive: true,
  },
  {
    code: 'LC-EVERYDAY-CASHPLAN',
    name: 'Everyday Health Cash Plan',
    insurerName: 'Aviva Insurance Limited',
    distributorDetails: 'Distributed through LifeCome Live. Underwritten by Aviva Insurance Limited.',
    summary: 'Cash-back benefits towards everyday routine health costs: optical, dental, physiotherapy, and wellness sessions.',
    benefits: [
      '100% cash back on routine dental check-ups and hygienist visits up to £150/year',
      'Optical benefit for glasses, prescription lenses, and eye exams up to £150/year',
      'Complementary therapy: physiotherapy, osteopathy, and lifestyle coaching up to £250/year',
      '24/7 confidential GP and stress support helpline',
    ],
    exclusions: [
      'Cosmetic treatments and unaccredited alternative practitioners',
      'Claims submitted without valid itemised receipt within 6 months of visit',
    ],
    eligibilityCriteria: 'Open to all UK residents aged 18 to 65. No pre-enrollment medical screening required.',
    monthlyPremiumEstimate: 'From £19.50/month',
    policyDocumentUrl: 'https://lifecome.co.uk/docs/insurance/everyday-cashplan.pdf',
    isActive: true,
  },
];

const SUPPORTED_PROVIDERS = [
  { id: 'bupa-uk', name: 'Bupa UK', code: 'BUPA', requiresGroupNumber: false, helpline: '+44 800 001 011' },
  { id: 'axa-health', name: 'AXA Health', code: 'AXA', requiresGroupNumber: true, helpline: '+44 800 002 022' },
  { id: 'aviva-health', name: 'Aviva Health', code: 'AVIVA', requiresGroupNumber: false, helpline: '+44 800 003 033' },
  { id: 'vitality', name: 'Vitality Health', code: 'VITALITY', requiresGroupNumber: false, helpline: '+44 800 004 044' },
  { id: 'wpa', name: 'WPA Healthcare', code: 'WPA', requiresGroupNumber: false, helpline: '+44 800 005 055' },
];

@Injectable()
export class InsuranceService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  async getOverview(accountId?: string) {
    let linkedPoliciesCount = 0;
    if (accountId) {
      const patient = await this.patients.getByUserAccountId(accountId);
      if (patient) {
        const policies = await this.db
          .select()
          .from(insurancePolicies)
          .where(eq(insurancePolicies.patientId, patient.id));
        linkedPoliciesCount = policies.length;
      }
    }

    return {
      title: 'Insurance',
      headline: 'Explore cover and access your policy support',
      intentions: [
        {
          id: 'explore-cover',
          title: 'Explore cover',
          description: 'Find private healthcare, cash plan, and diagnostic insurance suited to your needs.',
          actionText: 'Explore cover',
          route: '/insurance/products',
        },
        {
          id: 'my-policies',
          title: 'My policies',
          description: 'View your verified policy details, coverage status, and documents.',
          actionText: 'Manage policies',
          route: '/insurance/my-policies',
        },
        {
          id: 'check-cover',
          title: 'Check cover for a service',
          description: 'Check whether a specific GP, clinic, or care visit is funded by your policy.',
          actionText: 'Check service cover',
          route: '/insurance/check-cover',
        },
        {
          id: 'claims-support',
          title: 'Claims & policy support',
          description: 'Access authorized claims guidance and direct insurer contact details.',
          actionText: 'View support',
          route: '/insurance/claims-support',
        },
      ],
      disclosures: {
        distributionRole:
          'LifeCome Live acts as an introducer and distributor for regulated insurance products. Insurance underwriting and claims decisions are made solely by the respective authorized insurer.',
        fundingSeparation:
          'Membership or employer benefits are distinct from private insurance policies. Linking an insurance policy allows eligible health services to be funded directly subject to policy verification.',
      },
      linkedPoliciesCount,
    };
  }

  async listProducts() {
    await this.ensureSeedData();
    return this.db.select().from(insuranceProducts).where(eq(insuranceProducts.isActive, true));
  }

  async getProductById(id: string) {
    await this.ensureSeedData();
    const [product] = await this.db.select().from(insuranceProducts).where(eq(insuranceProducts.id, id));
    if (!product || !product.isActive) {
      throw new NotFoundAppException('Insurance product');
    }
    return product;
  }

  async requestQuote(input: RequestInsuranceQuoteDto) {
    let product = null;
    if (input.productId) {
      product = await this.getProductById(input.productId);
    } else if (input.productCode) {
      const [found] = await this.db.select().from(insuranceProducts).where(eq(insuranceProducts.code, input.productCode));
      product = found ?? null;
    }

    const quoteRef = `QTE-${nanoidPolicy()}`;
    const baseMultiplier = input.age > 50 ? 1.4 : input.age > 35 ? 1.15 : 1.0;
    const levelMultiplier = input.coverageLevel === 'family' ? 2.5 : input.coverageLevel === 'couple' ? 1.8 : 1.0;
    const estimatedPence = Math.round(3450 * baseMultiplier * levelMultiplier);

    return {
      quoteReference: quoteRef,
      status: 'quote_generated',
      productName: product?.name ?? 'LifeCome Health Protection',
      insurerName: product?.insurerName ?? 'Authorized Partner Insurer',
      coverageLevel: input.coverageLevel,
      monthlyEstimatePence: estimatedPence,
      monthlyEstimateFormatted: `£${(estimatedPence / 100).toFixed(2)}/month`,
      indicativeAnnualEstimateFormatted: `£${((estimatedPence * 12 * 0.95) / 100).toFixed(2)}/year (incl. 5% annual discount)`,
      continuationJourney: {
        providerHostedUrl: `https://underwriting-portal.partner-insurer.co.uk/apply?ref=${quoteRef}`,
        sharedFields: ['Applicant age', 'Postal code', 'Coverage tier', 'Email address'],
        notice:
          'You are continuing to our authorized partner insurer underwriting portal to finalize your medical declarations and policy issuance.',
      },
    };
  }

  listProviders() {
    return SUPPORTED_PROVIDERS;
  }

  async linkPolicy(accountId: string, input: LinkInsurancePolicyDto) {
    const patient = await this.patients.requireProfile(accountId);

    // Initial state is verification_pending (per specification: a user-supplied policy is not verified cover!)
    const [policy] = await this.db
      .insert(insurancePolicies)
      .values({
        patientId: patient.id,
        providerName: input.providerName,
        policyNumber: input.policyNumber,
        policyHolderName: input.policyHolderName,
        verificationStatus: 'verification_pending',
        coverageDetails: {
          inpatientAllowance: 'Included (Subject to referral)',
          outpatientAllowance: '£1,250 annual outpatient limit',
          excessPence: 10000, // £100 excess
          copayPct: 0,
        },
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 365 * 86_400_000),
      })
      .returning();

    return {
      ...policy,
      verificationStateExplanation:
        'Policy registered. Verification is currently pending with your insurer. Once verified, eligible services can be funded directly through this policy.',
    };
  }

  async listMyPolicies(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.patientId, patient.id))
      .orderBy(desc(insurancePolicies.createdAt));
  }

  async getMyPolicyById(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [policy] = await this.db
      .select()
      .from(insurancePolicies)
      .where(and(eq(insurancePolicies.id, id), eq(insurancePolicies.patientId, patient.id)));
    if (!policy) throw new NotFoundAppException('Insurance policy');

    return policy;
  }

  async unlinkPolicy(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [policy] = await this.db
      .select()
      .from(insurancePolicies)
      .where(and(eq(insurancePolicies.id, id), eq(insurancePolicies.patientId, patient.id)));
    if (!policy) throw new NotFoundAppException('Insurance policy');

    await this.db.delete(insurancePolicies).where(eq(insurancePolicies.id, id));
    return { success: true, message: 'Policy unlinked from your account.' };
  }

  async checkCoverForService(accountId: string, input: CheckServiceCoverDto) {
    const patient = await this.patients.requireProfile(accountId);
    const policy = await this.getMyPolicyById(accountId, input.policyId);

    // Determine funding status based on verification and service code
    let fundingStatus: 'included' | 'additional_payment_required' | 'authorisation_pending' | 'not_included' = 'not_included';
    let coPayAmount: string | null = null;
    let preAuthRequired = false;
    let notes = '';

    if (policy.verificationStatus === 'verification_pending') {
      fundingStatus = 'authorisation_pending';
      notes = 'Policy verification is pending. Direct coverage cannot be confirmed until verification completes.';
    } else if (policy.verificationStatus === 'verified') {
      if (input.serviceCode.includes('gp') || input.serviceCode.includes('menopause')) {
        fundingStatus = 'included';
        coPayAmount = '£0.00';
        notes = 'GP consultation and menopause review are fully included under your verified policy.';
      } else if (input.serviceCode.includes('care')) {
        fundingStatus = 'additional_payment_required';
        coPayAmount = '£15.00/hour patient contribution';
        preAuthRequired = true;
        notes = 'Partial visiting care allowance included. Requires pre-authorisation before booking confirmation.';
      } else {
        fundingStatus = 'not_included';
        notes = 'Retail products and educational coaching sessions are not covered under private medical insurance.';
      }
    } else {
      fundingStatus = 'not_included';
      notes = `Your policy status is ${policy.verificationStatus}. Direct settlement is not available.`;
    }

    const [check] = await this.db
      .insert(insuranceCoverChecks)
      .values({
        patientId: patient.id,
        policyId: policy.id,
        serviceCode: input.serviceCode,
        serviceName: this.formatServiceName(input.serviceCode),
        fundingStatus,
        coPayAmount,
        preAuthRequired,
        notes,
      })
      .returning();

    return check;
  }

  getClaimsSupport() {
    return {
      title: 'Claims and Policy Support',
      notice:
        'LifeCome Live is not an insurer and does not adjudicate claims. For claim pre-authorisation or reimbursement status, contact your insurer directly below.',
      providers: SUPPORTED_PROVIDERS.map((p) => ({
        provider: p.name,
        claimsLine: p.helpline,
        openingHours: 'Monday - Friday, 08:00 - 18:00; Saturday, 09:00 - 13:00',
        claimsProcedure:
          'Quote your policy number and obtain a pre-authorisation code prior to scheduling secondary care or diagnostic procedures.',
      })),
      generalAssistance: {
        lifeComeInsuranceDesk: '+44 20 7946 0950',
        email: 'insurance-support@lifecome.co.uk',
        hours: 'Monday - Friday, 09:00 - 17:00',
      },
    };
  }

  private formatServiceName(code: string): string {
    const map: Record<string, string> = {
      'gp-consultation': 'Online GP Consultation',
      'clinic-appointment': 'Clinic GP In-Person Visit',
      'menopause-review': 'Menopause Specialist Assessment',
      'visiting-care': 'Visiting Care Support',
      'personal-care': 'Personal Care Assistance',
      'wellbeing-coaching': 'Lifestyle & Wellbeing Coaching',
    };
    return map[code] ?? code;
  }

  private async ensureSeedData() {
    const count = await this.db.select().from(insuranceProducts).limit(1);
    if (count.length === 0) {
      await this.db.insert(insuranceProducts).values(DEFAULT_INSURANCE_PRODUCTS);
    }
  }
}
