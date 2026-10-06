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
const _configuration = require("../../common/config/configuration");
const _schedulingservice = require("../scheduling/scheduling.service");
const _patientservice = require("../patient/patient.service");
const _patientnotificationsservice = require("../patient-notifications/patient-notifications.service");
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
    /** View 15 — Review Booking & Payment (the appointment is created in `slot_held` state here). */ async create(input) {
        // Re-asserts the hold; throws SLOT_UNAVAILABLE if it has expired or was taken meanwhile.
        await this.scheduling.holdSlot(input.availabilitySlotId);
        const [appointment] = await this.db.insert(_schema.appointments).values({
            ...input,
            status: 'slot_held'
        }).returning();
        return appointment;
    }
    // ---- The signed-in patient's own appointments --------------------------------------------
    /** Creates a held appointment for the signed-in patient, after checking the booking makes sense. */ async createForPatient(accountId, input) {
        const patient = await this.patients.requireProfile(accountId);
        const [slot] = await this.db.select().from(_schema.availabilitySlots).where((0, _drizzleorm.eq)(_schema.availabilitySlots.id, input.availabilitySlotId));
        if (!slot) throw new _appexception.NotFoundAppException('Availability slot');
        if (slot.providerId !== input.providerId) {
            throw new _appexception.AppException('SLOT_PROVIDER_MISMATCH', 'That time does not belong to this clinician.', _common.HttpStatus.BAD_REQUEST);
        }
        if (slot.startsAt.getTime() <= Date.now()) {
            throw new _appexception.AppException('SLOT_IN_PAST', 'That time has already passed. Please choose another.', _common.HttpStatus.BAD_REQUEST);
        }
        const [provider] = await this.db.select().from(_schema.providers).where((0, _drizzleorm.eq)(_schema.providers.id, input.providerId));
        if (!provider || provider.networkStatus !== 'active') throw new _appexception.NotFoundAppException('Provider');
        if (!provider.consultationModes.includes(input.consultationMode)) {
            throw new _appexception.AppException('MODE_NOT_OFFERED', 'This clinician does not offer that type of appointment.', _common.HttpStatus.BAD_REQUEST);
        }
        const [service] = await this.db.select().from(_schema.clinicalServices).where((0, _drizzleorm.eq)(_schema.clinicalServices.id, input.clinicalServiceId));
        if (!service || !service.isActive) throw new _appexception.NotFoundAppException('Clinical service');
        return this.create({
            ...input,
            patientId: patient.id
        });
    }
    /** The patient's own appointments, soonest-created first. */ async listForPatient(accountId) {
        const patient = await this.patients.getByUserAccountId(accountId);
        if (!patient) return [];
        return this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.appointments),
            providerName: _schema.providers.displayName,
            serviceName: _schema.clinicalServices.name,
            startsAt: _schema.availabilitySlots.startsAt,
            durationMinutes: _schema.availabilitySlots.durationMinutes
        }).from(_schema.appointments).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).innerJoin(_schema.availabilitySlots, (0, _drizzleorm.eq)(_schema.appointments.availabilitySlotId, _schema.availabilitySlots.id)).where((0, _drizzleorm.eq)(_schema.appointments.patientId, patient.id)).orderBy((0, _drizzleorm.desc)(_schema.availabilitySlots.startsAt));
    }
    /** One appointment, but only if it belongs to this patient - anyone else's looks like it doesn't exist. */ async getForPatient(accountId, id) {
        const patient = await this.patients.requireProfile(accountId);
        const [row] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.appointments),
            providerName: _schema.providers.displayName,
            serviceName: _schema.clinicalServices.name,
            startsAt: _schema.availabilitySlots.startsAt,
            durationMinutes: _schema.availabilitySlots.durationMinutes
        }).from(_schema.appointments).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).innerJoin(_schema.availabilitySlots, (0, _drizzleorm.eq)(_schema.appointments.availabilitySlotId, _schema.availabilitySlots.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.appointments.id, id), (0, _drizzleorm.eq)(_schema.appointments.patientId, patient.id)));
        if (!row) throw new _appexception.NotFoundAppException('Appointment');
        return row;
    }
    /** The patient confirming their own held booking - only while `ALLOW_SELF_CONFIRM_BOOKINGS` is on. */ async confirmForPatient(accountId, id) {
        if (!this.config.allowSelfConfirmBookings) {
            throw new _appexception.AppException('PAYMENT_REQUIRED', 'This booking is confirmed once payment or authorisation completes.', _common.HttpStatus.FORBIDDEN);
        }
        await this.getForPatient(accountId, id);
        return this.confirm(id);
    }
    async cancelForPatient(accountId, id) {
        await this.getForPatient(accountId, id);
        return this.cancel(id);
    }
    async getById(id) {
        const [appointment] = await this.db.select().from(_schema.appointments).where((0, _drizzleorm.eq)(_schema.appointments.id, id));
        if (!appointment) throw new _appexception.NotFoundAppException('Appointment');
        return appointment;
    }
    /** `/admin/bookings/:id` — the booking detail page. */ async adminGet(id) {
        const [row] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.appointments),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`,
            providerName: _schema.providers.displayName,
            serviceName: _schema.clinicalServices.name,
            feeKobo: _schema.clinicalServices.basePriceKobo,
            startsAt: _schema.availabilitySlots.startsAt,
            durationMinutes: _schema.availabilitySlots.durationMinutes
        }).from(_schema.appointments).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.appointments.patientId, _schema.patients.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.clinicalServices, (0, _drizzleorm.eq)(_schema.appointments.clinicalServiceId, _schema.clinicalServices.id)).innerJoin(_schema.availabilitySlots, (0, _drizzleorm.eq)(_schema.appointments.availabilitySlotId, _schema.availabilitySlots.id)).where((0, _drizzleorm.eq)(_schema.appointments.id, id));
        if (!row) throw new _appexception.NotFoundAppException('Appointment');
        return row;
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
        await this.notifyPatient(updated, 'confirmed');
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
        await this.notifyPatient(updated, 'cancelled');
        return updated;
    }
    /** Tells the patient (in their notification feed) that their booking was confirmed or cancelled. */ async notifyPatient(appointment, change) {
        try {
            const [row] = await this.db.select({
                providerName: _schema.providers.displayName,
                startsAt: _schema.availabilitySlots.startsAt,
                country: _schema.patients.country
            }).from(_schema.appointments).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.appointments.providerId, _schema.providers.id)).innerJoin(_schema.availabilitySlots, (0, _drizzleorm.eq)(_schema.appointments.availabilitySlotId, _schema.availabilitySlots.id)).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.appointments.patientId, _schema.patients.id)).where((0, _drizzleorm.eq)(_schema.appointments.id, appointment.id));
            if (!row) return;
            const timeZone = row.country === 'GB' ? 'Europe/London' : 'Africa/Lagos';
            const day = new Intl.DateTimeFormat('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone
            }).format(row.startsAt);
            const clock = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone
            }).format(row.startsAt);
            await this.notifications.notify({
                patientId: appointment.patientId,
                kind: 'booking',
                body: change === 'confirmed' ? `Your booking with ${row.providerName} has been confirmed for ${day} at ${clock}.` : `Your booking with ${row.providerName} on ${day} at ${clock} has been cancelled.`,
                highlights: [
                    row.providerName,
                    day
                ],
                actionLabel: 'View Booking',
                actionTarget: 'booking',
                actionRef: appointment.id
            });
        } catch  {
        // A notification is a courtesy - never let it undo the booking change.
        }
    }
    constructor(db, scheduling, patients, config, notifications){
        this.db = db;
        this.scheduling = scheduling;
        this.patients = patients;
        this.config = config;
        this.notifications = notifications;
    }
};
BookingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _schedulingservice.SchedulingService === "undefined" ? Object : _schedulingservice.SchedulingService,
        typeof _patientservice.PatientService === "undefined" ? Object : _patientservice.PatientService,
        typeof _configuration.AppConfigService === "undefined" ? Object : _configuration.AppConfigService,
        typeof _patientnotificationsservice.PatientNotificationsService === "undefined" ? Object : _patientnotificationsservice.PatientNotificationsService
    ])
], BookingService);

//# sourceMappingURL=booking.service.js.map