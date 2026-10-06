"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RolesGuard", {
    enumerable: true,
    get: function() {
        return RolesGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _rolesdecorator = require("./roles.decorator");
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
let RolesGuard = class RolesGuard {
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(_rolesdecorator.ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        const request = context.switchToHttp().getRequest();
        if (!requiredRoles || requiredRoles.length === 0) {
            // "Any signed-in staff" - except clinicians, who must be named explicitly (or the route opts in
            // with `@AllowClinician()`), so a doctor's login can never reach the admin data by default.
            if (request.staff.role === 'clinician') {
                const allowed = this.reflector.getAllAndOverride(_rolesdecorator.ALLOW_CLINICIAN_KEY, [
                    context.getHandler(),
                    context.getClass()
                ]);
                if (!allowed) throw new _common.ForbiddenException('Your role does not have access to this.');
            }
            return true;
        }
        if (!requiredRoles.includes(request.staff.role)) {
            throw new _common.ForbiddenException('Your role does not have access to this.');
        }
        return true;
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
RolesGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], RolesGuard);

//# sourceMappingURL=roles.guard.js.map