"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsAdminController", {
    enumerable: true,
    get: function() {
        return NotificationsAdminController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _notificationsdto = require("./dto/notifications.dto");
const _notificationsservice = require("./notifications.service");
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
let NotificationsAdminController = class NotificationsAdminController {
    list(query) {
        return this.notifications.adminList(query);
    }
    constructor(notifications){
        this.notifications = notifications;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _notificationsdto.ListNotificationLogsQueryDto === "undefined" ? Object : _notificationsdto.ListNotificationLogsQueryDto
    ]),
    _ts_metadata("design:returntype", void 0)
], NotificationsAdminController.prototype, "list", null);
NotificationsAdminController = _ts_decorate([
    (0, _swagger.ApiTags)('notifications'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin/notifications'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _notificationsservice.NotificationsService === "undefined" ? Object : _notificationsservice.NotificationsService
    ])
], NotificationsAdminController);

//# sourceMappingURL=notifications-admin.controller.js.map