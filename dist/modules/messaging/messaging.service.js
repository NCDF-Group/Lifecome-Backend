"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessagingService", {
    enumerable: true,
    get: function() {
        return MessagingService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _appexception = require("../../common/errors/app-exception");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
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
let MessagingService = class MessagingService {
    // ---- Patient side ---------------------------------------------------------------------------
    async createThreadForPatient(accountId, input) {
        const patient = await this.patients.requireProfile(accountId);
        return this.db.transaction(async (tx)=>{
            const [thread] = await tx.insert(_schema.messageThreads).values({
                patientId: patient.id,
                topic: input.topic,
                subject: topicLabel(input.topic)
            }).returning();
            const [message] = await tx.insert(_schema.messages).values({
                threadId: thread.id,
                senderType: 'patient',
                senderId: patient.id,
                body: input.body
            }).returning();
            return {
                thread,
                message
            };
        });
    }
    async listThreadsForPatient(accountId) {
        const patient = await this.patients.getByUserAccountId(accountId);
        if (!patient) return [];
        return this.threadSummaries((0, _drizzleorm.eq)(_schema.messageThreads.patientId, patient.id));
    }
    async listMessagesForPatient(accountId, threadId) {
        await this.ownThread(accountId, threadId);
        return this.listMessages(threadId);
    }
    async sendForPatient(accountId, threadId, input) {
        const thread = await this.ownThread(accountId, threadId);
        const [message] = await this.db.insert(_schema.messages).values({
            threadId,
            senderType: 'patient',
            senderId: thread.patientId,
            body: input.body
        }).returning();
        return message;
    }
    /** The thread, but only if it belongs to this patient - anyone else's looks like it doesn't exist. */ async ownThread(accountId, threadId) {
        const patient = await this.patients.requireProfile(accountId);
        const [thread] = await this.db.select().from(_schema.messageThreads).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.messageThreads.id, threadId), (0, _drizzleorm.eq)(_schema.messageThreads.patientId, patient.id)));
        if (!thread) throw new _appexception.NotFoundAppException('Message thread');
        return thread;
    }
    // ---- Care-team side (operations console) ----------------------------------------------------
    async adminList(query) {
        const where = query.topic ? (0, _drizzleorm.eq)(_schema.messageThreads.topic, query.topic) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.messageThreads).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.messageThreads),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`,
            lastMessage: (0, _drizzleorm.sql)`(select m.body from messages m where m.thread_id = ${_schema.messageThreads.id} order by m.sent_at desc limit 1)`,
            lastMessageAt: (0, _drizzleorm.sql)`(select max(m.sent_at) from messages m where m.thread_id = ${_schema.messageThreads.id})`
        }).from(_schema.messageThreads).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.messageThreads.patientId, _schema.patients.id)).where(where).orderBy((0, _drizzleorm.desc)((0, _drizzleorm.sql)`coalesce((select max(m.sent_at) from messages m where m.thread_id = ${_schema.messageThreads.id}), ${_schema.messageThreads.createdAt})`)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    async adminGetThread(threadId) {
        const [row] = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.messageThreads),
            patientName: (0, _drizzleorm.sql)`${_schema.patients.firstName} || ' ' || ${_schema.patients.lastName}`
        }).from(_schema.messageThreads).innerJoin(_schema.patients, (0, _drizzleorm.eq)(_schema.messageThreads.patientId, _schema.patients.id)).where((0, _drizzleorm.eq)(_schema.messageThreads.id, threadId));
        if (!row) throw new _appexception.NotFoundAppException('Message thread');
        const thread = await this.listMessages(threadId);
        const last = thread[thread.length - 1];
        return {
            ...row,
            lastMessage: last?.body ?? null,
            lastMessageAt: last?.sentAt ?? null,
            messages: thread
        };
    }
    async adminReply(threadId, staffId, input) {
        const [thread] = await this.db.select().from(_schema.messageThreads).where((0, _drizzleorm.eq)(_schema.messageThreads.id, threadId));
        if (!thread) throw new _appexception.NotFoundAppException('Message thread');
        const [message] = await this.db.insert(_schema.messages).values({
            threadId,
            senderType: 'care_team',
            senderId: staffId,
            body: input.body
        }).returning();
        await this.notifications.notify({
            patientId: thread.patientId,
            kind: 'support',
            body: 'Sent you a Message',
            preview: input.body.length > 160 ? `${input.body.slice(0, 157)}...` : input.body,
            actionTarget: 'messages',
            actionRef: threadId
        });
        return message;
    }
    // ---- Shared ---------------------------------------------------------------------------------
    listMessages(threadId) {
        return this.db.select().from(_schema.messages).where((0, _drizzleorm.eq)(_schema.messages.threadId, threadId)).orderBy((0, _drizzleorm.asc)(_schema.messages.sentAt));
    }
    threadSummaries(where) {
        return this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.messageThreads),
            lastMessage: (0, _drizzleorm.sql)`(select m.body from messages m where m.thread_id = ${_schema.messageThreads.id} order by m.sent_at desc limit 1)`,
            lastMessageAt: (0, _drizzleorm.sql)`(select max(m.sent_at) from messages m where m.thread_id = ${_schema.messageThreads.id})`
        }).from(_schema.messageThreads).where(where).orderBy((0, _drizzleorm.desc)(_schema.messageThreads.createdAt));
    }
    constructor(db, patients, notifications){
        this.db = db;
        this.patients = patients;
        this.notifications = notifications;
    }
};
MessagingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _patientservice.PatientService === "undefined" ? Object : _patientservice.PatientService,
        typeof _patientnotificationsservice.PatientNotificationsService === "undefined" ? Object : _patientnotificationsservice.PatientNotificationsService
    ])
], MessagingService);
const TOPIC_LABELS = {
    booking_payments: 'Booking and payments',
    online_appointment: 'Online appointment',
    clinic_visit: 'Clinic visit',
    follow_up: 'Follow-up query'
};
function topicLabel(topic) {
    return TOPIC_LABELS[topic] ?? topic;
}

//# sourceMappingURL=messaging.service.js.map