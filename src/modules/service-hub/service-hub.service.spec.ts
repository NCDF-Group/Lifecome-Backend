import { describe, expect, it } from 'vitest';
import { ServiceHubService } from './service-hub.service';

describe('ServiceHubService', () => {
  const service = new ServiceHubService();

  it('returns exactly the four launch services: GP, Care, Wellbeing, and Insurance', () => {
    const overview = service.getOverview();
    expect(overview.headline).toBe('Your health. Your life. Connected.');
    expect(overview.services).toHaveLength(4);

    const serviceIds = overview.services.map((s) => s.id);
    expect(serviceIds).toEqual(['gp', 'care', 'wellbeing', 'insurance']);

    const gp = overview.services.find((s) => s.id === 'gp');
    expect(gp?.mainAction).toBe('Book a GP appointment');
    expect(gp?.description).toContain('Online GP, physical clinic appointments and Menopause Care');

    const care = overview.services.find((s) => s.id === 'care');
    expect(care?.mainAction).toBe('Request a care assessment');

    const wellbeing = overview.services.find((s) => s.id === 'wellbeing');
    expect(wellbeing?.mainAction).toBe('Explore sessions or shop');

    const insurance = overview.services.find((s) => s.id === 'insurance');
    expect(insurance?.mainAction).toBe('Explore cover or view policies');
  });

  it('returns urgent emergency guidance with NHS 111 and 999 details', () => {
    const guidance = service.getEmergencyGuidance();
    expect(guidance.ukContacts.lifeThreatening.number).toBe('999');
    expect(guidance.ukContacts.urgentMedical.number).toBe('111');
  });
});
