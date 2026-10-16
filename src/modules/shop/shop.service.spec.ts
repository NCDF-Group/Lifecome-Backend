import { describe, expect, it } from 'vitest';
import { ShopService } from './shop.service';

describe('ShopService', () => {
  const fakeDb: any = {};
  const fakePatients: any = {};
  const service = new ShopService(fakeDb, fakePatients);

  it('returns valid product categories separating supplements from prescription medicines', () => {
    const categories = service.listCategories();
    expect(categories.length).toBeGreaterThanOrEqual(4);
    const ids = categories.map((c) => c.id);
    expect(ids).toContain('vitamins_supplements');
    expect(ids).toContain('herbal_remedies');
    expect(ids).toContain('sleep_relaxation');
  });
});
