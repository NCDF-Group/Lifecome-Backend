import { describe, expect, it } from 'vitest';
import { WellbeingService } from './wellbeing.service';

describe('WellbeingService', () => {
  const fakeDb: any = {};
  const fakePatients: any = {};
  const service = new WellbeingService(fakeDb, fakePatients);

  it('returns the 3 approved educational and coaching session types', () => {
    const sessions = service.getSessionCatalogue();
    expect(sessions).toHaveLength(3);

    const types = sessions.map((s) => s.sessionType);
    expect(types).toContain('lifestyle_coaching');
    expect(types).toContain('healthy_eating');
    expect(types).toContain('stress_management');
  });

  it('returns wellbeing hub with 4 destinations matching specification', async () => {
    const hub = await service.getHub();
    expect(hub.title).toBe('Wellbeing');
    expect(hub.services).toHaveLength(4);
    const serviceIds = hub.services.map((s) => s.id);
    expect(serviceIds).toContain('lifestyle-coaching');
    expect(serviceIds).toContain('healthy-eating');
    expect(serviceIds).toContain('stress-management');
    expect(serviceIds).toContain('wellbeing-shop');
  });
});
