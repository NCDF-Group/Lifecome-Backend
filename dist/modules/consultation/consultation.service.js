"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ConsultationService", {
    enumerable: true,
    get: function() {
        return ConsultationService;
    }
});
const _nodecrypto = require("node:crypto");
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
/**
 * The waiting-room state machine (blueprint §10.1):
 *
 *   BOOKED → CHECK_IN_OPEN → DEVICE_CHECK → WAITING → CLINICIAN_JOINING → CONNECTED → ENDED
 *                            ↘ SUPPORT / RECONNECT / AUDIO_FALLBACK ↗
 *
 * Only the transitions below are legal; anything else throws. No RTC vendor is wired in yet
 * (blueprint §10 / tech-stack-recommendation §9 — an open ⚠ decision), so `roomName` is a
 * placeholder and no participant tokens are issued. When a vendor is chosen, that logic replaces
 * the TODO in `start()` without changing this state machine.
 */ const ALLOWED_TRANSITIONS = {
    booked: [
        'check_in_open'
    ],
    check_in_open: [
        'device_check'
    ],
    device_check: [
        'waiting'
    ],
    waiting: [
        'clinician_joining',
        'reconnecting'
    ],
    clinician_joining: [
        'connected',
        'reconnecting'
    ],
    connected: [
        'reconnecting',
        'audio_fallback',
        'ended'
    ],
    reconnecting: [
        'connected',
        'audio_fallback',
        'waiting',
        'ended'
    ],
    audio_fallback: [
        'connected',
        'ended'
    ],
    ended: []
};
let ConsultationService = class ConsultationService {
    async getOrCreateForAppointment(appointmentId) {
        const [existing] = await this.db.select().from(_schema.consultationSessions).where((0, _drizzleorm.eq)(_schema.consultationSessions.appointmentId, appointmentId));
        if (existing) return existing;
        // TODO: once an RTC vendor is chosen, create the room with that provider here instead.
        const [created] = await this.db.insert(_schema.consultationSessions).values({
            appointmentId,
            roomName: `room_${(0, _nodecrypto.randomUUID)()}`
        }).returning();
        return created;
    }
    async transition(appointmentId, to) {
        const session = await this.getOrCreateForAppointment(appointmentId);
        const allowed = ALLOWED_TRANSITIONS[session.status];
        if (!allowed.includes(to)) {
            throw new _appexception.AppException('ILLEGAL_CONSULTATION_TRANSITION', `Cannot move a consultation from '${session.status}' to '${to}'.`, 409);
        }
        const patch = {
            status: to
        };
        if (to === 'connected' && !session.startedAt) patch.startedAt = new Date();
        if (to === 'ended') patch.endedAt = new Date();
        const [updated] = await this.db.update(_schema.consultationSessions).set(patch).where((0, _drizzleorm.eq)(_schema.consultationSessions.id, session.id)).returning();
        if (!updated) throw new _appexception.NotFoundAppException('Consultation session');
        return updated;
    }
    constructor(db){
        this.db = db;
    }
};
ConsultationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], ConsultationService);

//# sourceMappingURL=consultation.service.js.map