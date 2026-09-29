"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsModule", {
    enumerable: true,
    get: function() {
        return NotificationsModule;
    }
});
const _common = require("@nestjs/common");
const _notificationsadmincontroller = require("./notifications-admin.controller");
const _notificationscontroller = require("./notifications.controller");
const _notificationsservice = require("./notifications.service");
const _notificationsprocessor = require("./processors/notifications.processor");
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
let NotificationsModule = class NotificationsModule {
};
NotificationsModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _notificationscontroller.NotificationsController,
            _notificationsadmincontroller.NotificationsAdminController
        ],
        providers: [
            _notificationsservice.NotificationsService,
            _notificationsprocessor.NotificationsProcessor
        ],
        exports: [
            _notificationsservice.NotificationsService
        ]
    })
], NotificationsModule);

//# sourceMappingURL=notifications.module.js.map