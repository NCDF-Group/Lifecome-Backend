import { describe, expect, it, vi } from 'vitest';
import { CareService } from './care.service';

describe('CareService', () => {
  const fakeDb: any = {};
  const fakePatients: any = {
    getByUserAccountId: vi.fn().mockResolvedValue(null),
  };
  const service = new CareService(fakeDb, fakePatients);

  it('returns care overview with legal delivery organisation and 3-step assessment process', async () => {
    const overview = await service.getOverview('');
    expect(overview.title).toBe('Professional care');
    expect(overview.providerClarity.legalOrganisation).toBe('LifeCome Care Services UK Ltd');
    expect(overview.howAssessmentWorks).toHaveLength(3);
    expect(overview.quickActions).toHaveLength(4);
  });

  it('returns care services catalogue with visiting, personal, and companionship care', () => {
    const catalogue = service.getServicesCatalogue();
    expect(catalogue.provider).toBe('LifeCome Care Services UK Ltd');
    expect(catalogue.services.length).toBeGreaterThanOrEqual(4);

    const codes = catalogue.services.map((s) => s.code);
    expect(codes).toContain('VISITING_CARE');
    expect(codes).toContain('PERSONAL_CARE');
    expect(codes).toContain('COMPANIONSHIP');
  });
});
