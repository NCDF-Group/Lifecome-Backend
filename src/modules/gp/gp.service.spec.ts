import { describe, expect, it } from 'vitest';
import { GpService } from './gp.service';

describe('GpService', () => {
  const fakeDb: any = {};
  const fakePatients: any = {};
  const service = new GpService(fakeDb, fakePatients);

  it('returns GP hub structure with Online GP, Clinic appointments, and Menopause Care', () => {
    const hub = service.getHub();
    expect(hub.title).toBe('GP services');
    expect(hub.sections).toHaveLength(4);

    const sectionIds = hub.sections.map((s) => s.id);
    expect(sectionIds).toContain('online-gp');
    expect(sectionIds).toContain('clinic-appointments');
    expect(sectionIds).toContain('menopause-care');
    expect(sectionIds).toContain('clinical-care-plan');
  });

  it('returns menopause overview with specific headline and dual pathways', () => {
    const overview = service.getMenopauseOverview();
    expect(overview.headline).toBe('Menopause care, centred on you.');
    expect(overview.subhead).toBe('Assessment, treatment options and ongoing support');
    expect(overview.pathways).toHaveLength(2);
    expect(overview.pathways[0].title).toBe('Start assessment');
    expect(overview.pathways[1].title).toBe('Book a treatment review');
    expect(overview.clinicalAssurance).toContain('strictly separate from retail products');
  });
});
