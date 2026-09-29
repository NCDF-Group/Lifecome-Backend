"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminDashboardController", {
    enumerable: true,
    get: function() {
        return AdminDashboardController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _commonauthmodule = require("../../common/auth/common-auth.module");
const _admindashboardservice = require("./admin-dashboard.service");
const _adminlocationsservice = require("./admin-locations.service");
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
let AdminDashboardController = class AdminDashboardController {
    getDashboard() {
        return this.dashboard.getSummary();
    }
    getLocations() {
        return this.locations.getOverview();
    }
    constructor(dashboard, locations){
        this.dashboard = dashboard;
        this.locations = locations;
    }
};
_ts_decorate([
    (0, _common.Get)('dashboard'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], AdminDashboardController.prototype, "getDashboard", null);
_ts_decorate([
    (0, _common.Get)('locations'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], AdminDashboardController.prototype, "getLocations", null);
AdminDashboardController = _ts_decorate([
    (0, _swagger.ApiTags)('admin-dashboard'),
    (0, _common.UseGuards)(_commonauthmodule.JwtAuthGuard, _commonauthmodule.RolesGuard),
    (0, _common.Controller)('admin'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _admindashboardservice.AdminDashboardService === "undefined" ? Object : _admindashboardservice.AdminDashboardService,
        typeof _adminlocationsservice.AdminLocationsService === "undefined" ? Object : _adminlocationsservice.AdminLocationsService
    ])
], AdminDashboardController);

//# sourceMappingURL=admin-dashboard.controller.js.map