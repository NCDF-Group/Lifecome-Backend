import { describe, expect, it } from 'vitest';
import { InsuranceService } from './insurance.service';

describe('InsuranceService', () => {
  const fakeDb: any = {};
  const fakePatients: any = {};
  const service = new InsuranceService(fakeDb, fakePatients);

  it('returns insurance overview with 4 intentions and legal disclosures', async () => {
    const overview = await service.getOverview();
    expect(overview.title).toBe('Insurance');
    expect(overview.intentions).toHaveLength(4);

    const intentionIds = overview.intentions.map((i) => i.id);
    expect(intentionIds).toContain('explore-cover');
    expect(intentionIds).toContain('my-policies');
    expect(intentionIds).toContain('check-cover');
    expect(intentionIds).toContain('claims-support');

    expect(overview.disclosures.fundingSeparation).toContain('distinct from private insurance policies');
  });

  it('returns supported insurance providers with claims helplines', () => {
    const providers = service.listProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);
    const names = providers.map((p) => p.name);
    expect(names).toContain('Bupa UK');
    expect(names).toContain('AXA Health');
    expect(names).toContain('Aviva Health');
  });

  it('generates an indicative quote with provider continuation journey', async () => {
    const quote = await service.requestQuote({
      age: 40,
      postcode: 'SW1A 1AA',
      coverageLevel: 'individual',
      email: 'test@example.com',
    });
    expect(quote.status).toBe('quote_generated');
    expect(quote.quoteReference).toMatch(/^QTE-/);
    expect(quote.continuationJourney.providerHostedUrl).toContain('underwriting-portal');
  });
});
