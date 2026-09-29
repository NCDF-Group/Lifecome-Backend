import { Inject, Injectable } from '@nestjs/common';
import { count, eq, gte, sql } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { appointments, patients, paymentTransactions, providers } from '../../db/schema';

const TREND_DAYS = 14;
const NEW_PATIENT_DAYS = 30;

/** The markets the console reports on, keyed by ISO 3166-1 alpha-2 country code. */
export type MarketCode = 'NG' | 'GB';

export interface MarketSummary {
  patients: number;
  newPatientsLast30Days: number;
  bookings: number;
}

export interface BookingsTrendPoint {
  date: string;
  count: number;
}

export interface DashboardSummary {
  totals: {
    patients: number;
    activeProviders: number;
    bookings: number;
    successfulPayments: { count: number; amountKobo: number };
  };
  bookingsByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
  bookingsTrend: BookingsTrendPoint[];
  /** Patients and their bookings split by the patient's `country`. `other` counts patients whose
   * country is neither market, so `NG + GB + other` always equals `totals.patients`. */
  byMarket: Record<MarketCode, MarketSummary> & { other: { patients: number } };
}

/** Backs `/admin/dashboard` — the operations console's landing page. Every number here is a live
 * cross-table aggregate, not a per-module list, which is why it lives in its own module rather
 * than any one domain module. */
@Injectable()
export class AdminDashboardService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async getSummary(): Promise<DashboardSummary> {
    const [
      [{ patientCount }],
      [{ activeProviderCount }],
      [{ bookingCount }],
      [{ successfulCount, successfulAmountKobo }],
      bookingsByStatusRows,
      paymentsByStatusRows,
      bookingsTrend,
      byMarket,
    ] = await Promise.all([
      this.db.select({ patientCount: count() }).from(patients),
      this.db.select({ activeProviderCount: count() }).from(providers).where(eq(providers.networkStatus, 'active')),
      this.db.select({ bookingCount: count() }).from(appointments),
      this.db
        .select({
          successfulCount: count(),
          successfulAmountKobo: sql<number>`coalesce(sum(${paymentTransactions.amountKobo}), 0)::int`,
        })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'successful')),
      this.db.select({ status: appointments.status, total: count() }).from(appointments).groupBy(appointments.status),
      this.db
        .select({ status: paymentTransactions.status, total: count() })
        .from(paymentTransactions)
        .groupBy(paymentTransactions.status),
      this.getBookingsTrend(),
      this.getByMarket(),
    ]);

    return {
      totals: {
        patients: patientCount,
        activeProviders: activeProviderCount,
        bookings: bookingCount,
        successfulPayments: { count: successfulCount, amountKobo: successfulAmountKobo },
      },
      bookingsByStatus: Object.fromEntries(bookingsByStatusRows.map((row) => [row.status, row.total])),
      paymentsByStatus: Object.fromEntries(paymentsByStatusRows.map((row) => [row.status, row.total])),
      bookingsTrend,
      byMarket,
    };
  }

  private async getByMarket(): Promise<DashboardSummary['byMarket']> {
    const since = new Date(Date.now() - NEW_PATIENT_DAYS * 24 * 60 * 60 * 1000);
    // Tolerates a hand-entered 'UK' alongside the ISO 'GB', and any casing.
    const market = sql<string>`case upper(${patients.country}) when 'NG' then 'NG' when 'GB' then 'GB' when 'UK' then 'GB' else 'other' end`;

    const [patientRows, bookingRows] = await Promise.all([
      this.db
        .select({
          market,
          total: count(),
          recent: sql<number>`count(*) filter (where ${patients.createdAt} >= ${since.toISOString()}::timestamptz)::int`,
        })
        .from(patients)
        .groupBy(market),
      this.db
        .select({ market, total: count() })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .groupBy(market),
    ]);

    const empty = (): MarketSummary => ({ patients: 0, newPatientsLast30Days: 0, bookings: 0 });
    const result: DashboardSummary['byMarket'] = { NG: empty(), GB: empty(), other: { patients: 0 } };

    for (const row of patientRows) {
      if (row.market === 'NG' || row.market === 'GB') {
        result[row.market].patients = row.total;
        result[row.market].newPatientsLast30Days = row.recent;
      } else {
        result.other.patients = row.total;
      }
    }
    for (const row of bookingRows) {
      if (row.market === 'NG' || row.market === 'GB') result[row.market].bookings = row.total;
    }

    return result;
  }

  private async getBookingsTrend(): Promise<BookingsTrendPoint[]> {
    const since = new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000);
    const day = sql`date_trunc('day', ${appointments.createdAt})`;

    const rows = await this.db
      .select({ date: sql<string>`to_char(${day}, 'YYYY-MM-DD')`, total: count() })
      .from(appointments)
      .where(gte(appointments.createdAt, since))
      .groupBy(day)
      .orderBy(day);

    return rows.map((row) => ({ date: row.date, count: row.total }));
  }
}
