"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessagingController", {
    enumerable: true,
    get: function() {
        return MessagingController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _messagingdto = require("./dto/messaging.dto");
const _messagingservice = require("./messaging.service");
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
let MessagingController = class MessagingController {
    constructor(messaging){
        this.messaging = messaging;
    }
    createThread(body) {
        return this.messaging.createThread(body);
    }
    listForPatient(patientId) {
        return this.messaging.listThreadsForPatient(patientId);
    }
    listMessages(id) {
        return this.messaging.listMessages(id);
    }
    send(id, body) {
        return this.messaging.send(id, body);
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _messagingdto.CreateThreadDto === "undefined" ? Object : _messagingdto.CreateThreadDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], MessagingController.prototype, "createThread", null);
_ts_decorate([
    (0, _common.Get)('patients/:patientId'),
    _ts_param(0, (0, _common.Param)('patientId', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], MessagingController.prototype, "listForPatient", null);
_ts_decorate([
    (0, _common.Get)(':id/messages'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], MessagingController.prototype, "listMessages", null);
_ts_decorate([
    (0, _common.Post)(':id/messages'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _messagingdto.SendMessageDto === "undefined" ? Object : _messagingdto.SendMessageDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], MessagingController.prototype, "send", null);
MessagingController = _ts_decorate([
    (0, _swagger.ApiTags)('messaging'),
    (0, _common.Controller)('message-threads'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _messagingservice.MessagingService === "undefined" ? Object : _messagingservice.MessagingService
    ])
], MessagingController);

//# sourceMappingURL=messaging.controller.js.map