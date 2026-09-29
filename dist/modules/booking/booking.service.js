"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BookingService", {
    enumerable: true,
    get: function() {
        return BookingService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
const _schedulingservice = require("../scheduling/scheduling.service");
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
const CANCELLABLE_STATUSES = [
    'slot_held',
    'confirmed'
];
let BookingService = class BookingService {
    constructor(db, scheduling){
        this.db = db;
        this.scheduling = scheduling;
    }
    /** View 15 — Review Booking & Payment (the appointment is created in `slot_held` state here). */ async create(input) {
        // Re-asserts the hold; throws SLOT_UNAVAILABLE if it has expired or was taken meanwhile.
        await this.scheduling.holdSlot(input.availabilitySlotId);
        const [appointment] = await this.db.insert(_schema.appointments).values({
            ...input,
            status: 'slot_held'
        }).returning();
        return appointment;
    }
    async getById(id) {
        const [appointment] = await this.db.select().from(_schema.appointments).where((0, _drizzleorm.eq)(_schema.appointments.id, id));
        if (!appointment) throw new _appexception.NotFoundAppException('Appointment');
        return appointment;
    }
    /** `/admin/bookings` — the "Bookings" page in the operations console. */ async adminList(query) {
        const conditions = [];
        if (query.status) conditions.push((0, _drizzleorm.eq)(_schema.appointments.status, query.status));
        if (query.patientId) conditions.push((0, _drizzleorm.eq)(_schema.appointments.patientId, query.patientId));
        if (query.providerId) conditions.push((0, _drizzleorm.eq)(_schema.appointments.providerId, query.providerId));
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.appointments).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.appointments),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`,
            providerName: _schema.providers.displayName,
            serviceName: _schema.clinicalServices.name,
            feeKobo: _schema.clinicalServices.basePriceKobo
        }).from(_schema.appointments).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.appointments.patientId, _schema.patients.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.appointments.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    /** View 17 — Booking Confirmation. Called once payment succeeds or HMO authorisation is approved. */ async confirm(id, authorisationId) {
        const appointment = await this.getById(id);
        if (appointment.status !== 'slot_held') {
            throw new _appexception.AppException('BOOKING_NOT_HOLDABLE', `This booking cannot be confirmed from its current state (${appointment.status}).`, 409);
        }
        await this.scheduling.markBooked(appointment.availabilitySlotId);
        const [updated] = await this.db.update(_schema.appointments).set({
            status: 'confirmed',
            authorisationId,
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.appointments.id, id)).returning();
        return updated;
    }
    async cancel(id) {
        const appointment = await this.getById(id);
        if (!CANCELLABLE_STATUSES.includes(appointment.status)) {
            throw new _appexception.AppException('BOOKING_NOT_CANCELLABLE', `This booking cannot be cancelled from its current state (${appointment.status}).`, 409);
        }
        await this.scheduling.release(appointment.availabilitySlotId);
        const [updated] = await this.db.update(_schema.appointments).set({
            status: 'cancelled',
            updatedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.appointments.id, id)).returning();
        return updated;
    }
};
BookingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _schedulingservice.SchedulingService === "undefined" ? Object : _schedulingservice.SchedulingService
    ])
], BookingService);

//# sourceMappingURL=booking.service.js.map