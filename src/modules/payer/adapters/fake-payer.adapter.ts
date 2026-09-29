import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type {
  AuthorisationStatusResult,
  CheckEligibilityInput,
  CheckEligibilityResult,
  PayerAdapter,
  RequestAuthorisationInput,
  RequestAuthorisationResult,
  VerifyMemberInput,
  VerifyMemberResult,
} from './payer-adapter.interface';

/**
 * An in-memory adapter with deterministic, obviously-fake behaviour, used for local development,
 * demos and end-to-end tests so the whole payer → eligibility → authorisation → booking flow can
 * be built and tested before a real HMO integration exists.
 *
 * Registered under payer code `FAKE_HMO` — see `payer-adapter.registry.ts`.
 */
@Injectable()
export class FakePayerAdapter implements PayerAdapter {
  readonly payerCode = 'FAKE_HMO';

  private readonly authorisations = new Map<string, AuthorisationStatusResult>();

  // These are synchronous under the hood (no network call to fake), but the interface is async
  // because every real adapter's implementation will be — hence `Promise.resolve(...)` rather
  // than `async`/`await` with nothing to actually await.

  verifyMember(input: VerifyMemberInput): Promise<VerifyMemberResult> {
    if (input.memberId.trim().length === 0) {
      return Promise.resolve({ status: 'not_found' });
    }
    // A member id ending in the digit 9 exercises the "needs manual review" state.
    if (input.memberId.endsWith('9')) {
      return Promise.resolve({ status: 'manual_review' });
    }
    return Promise.resolve({ status: 'verified', planId: 'FAKE-STANDARD' });
  }

  checkEligibility(input: CheckEligibilityInput): Promise<CheckEligibilityResult> {
    if (input.clinicalServiceCode === 'SPECIALIST') {
      return Promise.resolve({ status: 'pre_authorisation_required' });
    }
    if (input.clinicalServiceCode === 'COSMETIC') {
      return Promise.resolve({ status: 'excluded' });
    }
    return Promise.resolve({ status: 'covered' });
  }

  requestAuthorisation(_input: RequestAuthorisationInput): Promise<RequestAuthorisationResult> {
    const payerReference = `FAKE-AUTH-${randomUUID().slice(0, 8).toUpperCase()}`;
    const result: AuthorisationStatusResult = { status: 'approved', payerReference };
    this.authorisations.set(payerReference, result);
    return Promise.resolve({ status: 'approved', payerReference });
  }

  getAuthorisationStatus(payerReference: string): Promise<AuthorisationStatusResult> {
    return Promise.resolve(this.authorisations.get(payerReference) ?? { status: 'expired' });
  }
}
