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
let MessagingService = class MessagingService {
    constructor(db){
        this.db = db;
    }
    async createThread(input) {
        const [thread] = await this.db.insert(_schema.messageThreads).values(input).returning();
        return thread;
    }
    listThreadsForPatient(patientId) {
        return this.db.select().from(_schema.messageThreads).where((0, _drizzleorm.eq)(_schema.messageThreads.patientId, patientId));
    }
    async send(threadId, input) {
        const [thread] = await this.db.select().from(_schema.messageThreads).where((0, _drizzleorm.eq)(_schema.messageThreads.id, threadId));
        if (!thread) throw new _appexception.NotFoundAppException('Message thread');
        const [message] = await this.db.insert(_schema.messages).values({
            threadId,
            ...input
        }).returning();
        return message;
    }
    listMessages(threadId) {
        return this.db.select().from(_schema.messages).where((0, _drizzleorm.eq)(_schema.messages.threadId, threadId)).orderBy((0, _drizzleorm.asc)(_schema.messages.sentAt));
    }
};
MessagingService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], MessagingService);

//# sourceMappingURL=messaging.service.js.map