"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminDashboardService", {
    enumerable: true,
    get: function() {
        return AdminDashboardService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const TREND_DAYS = 14;
const NEW_PATIENT_DAYS = 30;
let AdminDashboardService = class AdminDashboardService {
    async getSummary() {
        const [[{ patientCount }], [{ activeProviderCount }], [{ bookingCount }], [{ successfulCount, successfulAmountKobo }], bookingsByStatusRows, paymentsByStatusRows, bookingsTrend, byMarket] = await Promise.all([
            this.db.select({
                patientCount: (0, _drizzleorm.count)()
            }).from(_schema.patients),
            this.db.select({
                activeProviderCount: (0, _drizzleorm.count)()
            }).from(_schema.providers).where((0, _drizzleorm.eq)(_schema.providers.networkStatus, 'active')),
            this.db.select({
                bookingCount: (0, _drizzleorm.count)()
            }).from(_schema.appointments),
            this.db.select({
                successfulCount: (0, _drizzleorm.count)(),
                successfulAmountKobo: (0, _drizzleorm.sql)`coalesce(sum(${_schema.paymentTransactions.amountKobo}), 0)::int`
            }).from(_schema.paymentTransactions).where((0, _drizzleorm.eq)(_schema.paymentTransactions.status, 'successful')),
            this.db.select({
                status: _schema.appointments.status,
                total: (0, _drizzleorm.count)()
            }).from(_schema.appointments).groupBy(_schema.appointments.status),
            this.db.select({
                status: _schema.paymentTransactions.status,
                total: (0, _drizzleorm.count)()
            }).from(_schema.paymentTransactions).groupBy(_schema.paymentTransactions.status),
            this.getBookingsTrend(),
            this.getByMarket()
        ]);
        return {
            totals: {
                patients: patientCount,
                activeProviders: activeProviderCount,
                bookings: bookingCount,
                successfulPayments: {
                    count: successfulCount,
                    amountKobo: successfulAmountKobo
                }
            },
            bookingsByStatus: Object.fromEntries(bookingsByStatusRows.map((row)=>[
                    row.status,
                    row.total
                ])),
            paymentsByStatus: Object.fromEntries(paymentsByStatusRows.map((row)=>[
                    row.status,
                    row.total
                ])),
            bookingsTrend,
            byMarket
        };
    }
    async getByMarket() {
        const since = new Date(Date.now() - NEW_PATIENT_DAYS * 24 * 60 * 60 * 1000);
        // Tolerates a hand-entered 'UK' alongside the ISO 'GB', and any casing.
        const market = (0, _drizzleorm.sql)`case upper(${_schema.patients.country}) when 'NG' then 'NG' when 'GB' then 'GB' when 'UK' then 'GB' else 'other' end`;
        const [patientRows, bookingRows] = await Promise.all([
            this.db.select({
                market,
                total: (0, _drizzleorm.count)(),
                recent: (0, _drizzleorm.sql)`count(*) filter (where ${_schema.patients.createdAt} >= ${since.toISOString()}::timestamptz)::int`
            }).from(_schema.patients).groupBy(market),
            this.db.select({
                market,
                total: (0, _drizzleorm.count)()
            }).from(_schema.appointments).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.appointments.patientId, _schema.patients.id)).groupBy(market)
        ]);
        const empty = ()=>({
                patients: 0,
                newPatientsLast30Days: 0,
                bookings: 0
            });
        const result = {
            NG: empty(),
            GB: empty(),
            other: {
                patients: 0
            }
        };
        for (const row of patientRows){
            if (row.market === 'NG' || row.market === 'GB') {
                result[row.market].patients = row.total;
                result[row.market].newPatientsLast30Days = row.recent;
            } else {
                result.other.patients = row.total;
            }
        }
        for (const row of bookingRows){
            if (row.market === 'NG' || row.market === 'GB') result[row.market].bookings = row.total;
        }
        return result;
    }
    async getBookingsTrend() {
        const since = new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000);
        const day = (0, _drizzleorm.sql)`date_trunc('day', ${_schema.appointments.createdAt})`;
        const rows = await this.db.select({
            date: (0, _drizzleorm.sql)`to_char(${day}, 'YYYY-MM-DD')`,
            total: (0, _drizzleorm.count)()
        }).from(_schema.appointments).where((0, _drizzleorm.gte)(_schema.appointments.createdAt, since)).groupBy(day).orderBy(day);
        return rows.map((row)=>({
                date: row.date,
                count: row.total
            }));
    }
    constructor(db){
        this.db = db;
    }
};
AdminDashboardService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], AdminDashboardService);

//# sourceMappingURL=admin-dashboard.service.js.map