"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsProcessor", {
    enumerable: true,
    get: function() {
        return NotificationsProcessor;
    }
});
const _bullmq = require("@nestjs/bullmq");
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _nestjspino = require("nestjs-pino");
const _client = require("../../../db/client");
const _schema = require("../../../db/schema");
const _queuemodule = require("../../../queue/queue.module");
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
let NotificationsProcessor = class NotificationsProcessor extends _bullmq.WorkerHost {
    async process(job) {
        const { channel, template, recipientUserAccountId, logId } = job.data;
        try {
            this.logger.info({
                channel,
                template,
                recipientUserAccountId,
                jobId: job.id
            }, 'Notification would be sent here');
            await this.db.update(_schema.notificationLogs).set({
                status: 'sent',
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.notificationLogs.id, logId));
        } catch (error) {
            const failureReason = error instanceof Error ? error.message : 'Unknown error';
            await this.db.update(_schema.notificationLogs).set({
                status: 'failed',
                failureReason,
                updatedAt: new Date()
            }).where((0, _drizzleorm.eq)(_schema.notificationLogs.id, logId));
            throw error;
        }
    }
    constructor(logger, db){
        super(), this.logger = logger, this.db = db;
    }
};
NotificationsProcessor = _ts_decorate([
    (0, _bullmq.Processor)(_queuemodule.QUEUE_NAMES.NOTIFICATIONS),
    _ts_param(0, (0, _nestjspino.InjectPinoLogger)(NotificationsProcessor.name)),
    _ts_param(1, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger,
        typeof Database === "undefined" ? Object : Database
    ])
], NotificationsProcessor);

//# sourceMappingURL=notifications.processor.js.map