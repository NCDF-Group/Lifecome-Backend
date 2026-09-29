"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SchedulingService", {
    enumerable: true,
    get: function() {
        return SchedulingService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
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
const HOLD_MINUTES = 10;
let SchedulingService = class SchedulingService {
    async listAvailable(providerId) {
        const now = new Date();
        return this.db.select().from(_schema.availabilitySlots).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.availabilitySlots.providerId, providerId), (0, _drizzleorm.eq)(_schema.availabilitySlots.isBooked, false), (0, _drizzleorm.gt)(_schema.availabilitySlots.startsAt, now), (0, _drizzleorm.or)((0, _drizzleorm.isNull)(_schema.availabilitySlots.heldUntil), (0, _drizzleorm.lt)(_schema.availabilitySlots.heldUntil, now))));
    }
    async createSlot(input) {
        const [slot] = await this.db.insert(_schema.availabilitySlots).values({
            providerId: input.providerId,
            startsAt: new Date(input.startsAt),
            durationMinutes: input.durationMinutes
        }).returning();
        return slot;
    }
    /**
   * Booking state 1/2 — "slot held" (blueprint §4.1). A single conditional UPDATE is the whole
   * concurrency guard: Postgres' row lock means two simultaneous holds on the same slot can't
   * both succeed, no separate application-level lock needed.
   */ async holdSlot(slotId) {
        const now = new Date();
        const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60_000);
        const [slot] = await this.db.update(_schema.availabilitySlots).set({
            heldUntil
        }).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.availabilitySlots.id, slotId), (0, _drizzleorm.eq)(_schema.availabilitySlots.isBooked, false), (0, _drizzleorm.or)((0, _drizzleorm.isNull)(_schema.availabilitySlots.heldUntil), (0, _drizzleorm.lt)(_schema.availabilitySlots.heldUntil, now)))).returning();
        if (!slot) {
            const [exists] = await this.db.select().from(_schema.availabilitySlots).where((0, _drizzleorm.eq)(_schema.availabilitySlots.id, slotId));
            if (!exists) throw new _appexception.NotFoundAppException('Availability slot');
            throw new _appexception.AppException('SLOT_UNAVAILABLE', 'This time is no longer available. Please choose another.', 409);
        }
        return slot;
    }
    /** Booking state 2/2, called by BookingService once an appointment is confirmed for this slot. */ async markBooked(slotId) {
        await this.db.update(_schema.availabilitySlots).set({
            isBooked: true,
            heldUntil: null
        }).where((0, _drizzleorm.eq)(_schema.availabilitySlots.id, slotId));
    }
    async release(slotId) {
        await this.db.update(_schema.availabilitySlots).set({
            heldUntil: null
        }).where((0, _drizzleorm.eq)(_schema.availabilitySlots.id, slotId));
    }
    constructor(db){
        this.db = db;
    }
};
SchedulingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], SchedulingService);

//# sourceMappingURL=scheduling.service.js.map