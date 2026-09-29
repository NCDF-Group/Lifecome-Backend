/**
 * The one contract every payer integrates through (blueprint §9.1). A payer is a registry row
 * plus one of these adapters — never a code branch. Adding an HMO means writing config and, if
 * needed, a new adapter implementation; it never means adding an `if (payer.code === '...')`
 * inside a domain service.
 */

export interface VerifyMemberInput {
  payerCode: string;
  memberId: string;
  patientDateOfBirth: string; // ISO date, used by most payers as a second verification factor
}

export interface VerifyMemberResult {
  status: 'verified' | 'not_found' | 'mismatch' | 'payer_unavailable' | 'manual_review';
  planId?: string;
  raw?: Record<string, unknown>;
}

export interface CheckEligibilityInput {
  payerCode: string;
  memberId: string;
  planId?: string;
  clinicalServiceCode: string;
  date: string; // ISO date
}

export interface CheckEligibilityResult {
  status: 'covered' | 'co_pay' | 'pre_authorisation_required' | 'excluded' | 'benefit_limit_reached' | 'payer_unavailable';
  coPayKobo?: number;
  raw?: Record<string, unknown>;
}

export interface RequestAuthorisationInput {
  payerCode: string;
  memberId: string;
  clinicalServiceCode: string;
  providerId: string;
  appointmentId: string;
}

export interface RequestAuthorisationResult {
  status: 'pending' | 'approved' | 'declined' | 'more_info_required';
  payerReference?: string;
  infoRequested?: string;
}

export interface AuthorisationStatusResult {
  status: 'pending' | 'approved' | 'declined' | 'expired' | 'more_info_required';
  payerReference?: string;
}

export interface PayerAdapter {
  readonly payerCode: string;
  verifyMember(input: VerifyMemberInput): Promise<VerifyMemberResult>;
  checkEligibility(input: CheckEligibilityInput): Promise<CheckEligibilityResult>;
  requestAuthorisation(input: RequestAuthorisationInput): Promise<RequestAuthorisationResult>;
  getAuthorisationStatus(payerReference: string): Promise<AuthorisationStatusResult>;
}
