import { Inject, Injectable } from '@nestjs/common';
import { count, isNotNull, isNull } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { patients, providers } from '../../db/schema';

export interface LocationSummary {
  city: string;
  state: string;
  patientCount: number;
  providerCount: number;
}

export interface LocationsOverview {
  locations: LocationSummary[];
  unregistered: { patients: number; providers: number };
}

/**
 * Backs `/admin/locations`. Deliberately built from each person's self-reported `city`/`state`
 * (the same optional field collected at signup — see `patient.schema.ts` and `provider.schema.ts`),
 * never a live device position: this platform has no location-tracking endpoint, and continuously
 * tracking a patient's real-time location is sensitive personal data that would need a clear legal
 * basis and explicit consent this feature doesn't have. See Lifecome-admin's README, "Locations,
 * not tracking", for the full reasoning — this service is that decision's backend counterpart.
 */
@Injectable()
export class AdminLocationsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getOverview(): Promise<LocationsOverview> {
    const [patientRows, providerRows, [{ unregisteredPatients }], [{ unregisteredProviders }]] = await Promise.all([
      this.db
        .select({ city: patients.city, state: patients.state, total: count() })
        .from(patients)
        .where(isNotNull(patients.city))
        .groupBy(patients.city, patients.state),
      this.db
        .select({ city: providers.city, state: providers.state, total: count() })
        .from(providers)
        .where(isNotNull(providers.city))
        .groupBy(providers.city, providers.state),
      this.db.select({ unregisteredPatients: count() }).from(patients).where(isNull(patients.city)),
      this.db.select({ unregisteredProviders: count() }).from(providers).where(isNull(providers.city)),
    ]);

    const byKey = new Map<string, LocationSummary>();
    const keyOf = (city: string, state: string | null): string => `${city}|${state ?? ''}`;

    for (const row of patientRows) {
      if (!row.city) continue;
      const key = keyOf(row.city, row.state);
      const existing = byKey.get(key) ?? { city: row.city, state: row.state ?? '', patientCount: 0, providerCount: 0 };
      existing.patientCount += row.total;
      byKey.set(key, existing);
    }

    for (const row of providerRows) {
      if (!row.city) continue;
      const key = keyOf(row.city, row.state);
      const existing = byKey.get(key) ?? { city: row.city, state: row.state ?? '', patientCount: 0, providerCount: 0 };
      existing.providerCount += row.total;
      byKey.set(key, existing);
    }

    const locations = [...byKey.values()].sort(
      (a, b) => b.patientCount + b.providerCount - (a.patientCount + a.providerCount),
    );

    return {
      locations,
      unregistered: { patients: unregisteredPatients, providers: unregisteredProviders },
    };
  }
}
