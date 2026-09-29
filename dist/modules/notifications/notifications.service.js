"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsService", {
    enumerable: true,
    get: function() {
        return NotificationsService;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _paginationdto = require("../../common/dto/pagination.dto");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _queuemodule = require("../../queue/queue.module");
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
const RETRY_ATTEMPTS = 5;
let NotificationsService = class NotificationsService {
    async enqueue(input) {
        const [log] = await this.db.insert(_schema.notificationLogs).values({
            recipientUserAccountId: input.recipientUserAccountId,
            channel: input.channel,
            template: input.template,
            status: 'queued'
        }).returning();
        const jobData = {
            ...input,
            logId: log.id
        };
        const job = await this.queue.add('send', jobData, {
            attempts: RETRY_ATTEMPTS,
            backoff: {
                type: 'exponential',
                delay: 5_000
            },
            removeOnComplete: 1_000,
            removeOnFail: 5_000
        });
        const jobId = job.id ?? '';
        await this.db.update(_schema.notificationLogs).set({
            jobId
        }).where((0, _drizzleorm.eq)(_schema.notificationLogs.id, log.id));
        return {
            jobId
        };
    }
    /** `/admin/notifications` — the "Notifications" page in the operations console. */ async adminList(query) {
        const conditions = [];
        if (query.channel) conditions.push((0, _drizzleorm.eq)(_schema.notificationLogs.channel, query.channel));
        if (query.status) conditions.push((0, _drizzleorm.eq)(_schema.notificationLogs.status, query.status));
        const where = conditions.length > 0 ? (0, _drizzleorm.and)(...conditions) : undefined;
        const [{ total }] = await this.db.select({
            total: (0, _drizzleorm.count)()
        }).from(_schema.notificationLogs).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.notificationLogs.recipientUserAccountId, _schema.userAccounts.id)).where(where);
        const items = await this.db.select({
            ...(0, _drizzleorm.getTableColumns)(_schema.notificationLogs),
            recipientPhoneNumber: _schema.userAccounts.phoneNumber,
            recipientEmail: _schema.userAccounts.email
        }).from(_schema.notificationLogs).innerJoin(_schema.userAccounts, (0, _drizzleorm.eq)(_schema.notificationLogs.recipientUserAccountId, _schema.userAccounts.id)).where(where).orderBy((0, _drizzleorm.desc)(_schema.notificationLogs.createdAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize);
        return (0, _paginationdto.paginate)(items, total, query.page, query.pageSize);
    }
    constructor(queue, db){
        this.queue = queue;
        this.db = db;
    }
};
NotificationsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _bullmq.InjectQueue)(_queuemodule.QUEUE_NAMES.NOTIFICATIONS)),
    _ts_param(1, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Queue === "undefined" ? Object : Queue,
        typeof Database === "undefined" ? Object : Database
    ])
], NotificationsService);

//# sourceMappingURL=notifications.service.js.map