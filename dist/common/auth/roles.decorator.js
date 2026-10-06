"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ALLOW_CLINICIAN_KEY () {
        return ALLOW_CLINICIAN_KEY;
    },
    get AllowClinician () {
        return AllowClinician;
    },
    get ROLES_KEY () {
        return ROLES_KEY;
    },
    get Roles () {
        return Roles;
    }
});
const _common = require("@nestjs/common");
const ROLES_KEY = 'roles';
const Roles = (...roles)=>(0, _common.SetMetadata)(ROLES_KEY, roles);
const ALLOW_CLINICIAN_KEY = 'allowClinician';
const AllowClinician = ()=>(0, _common.SetMetadata)(ALLOW_CLINICIAN_KEY, true);

//# sourceMappingURL=roles.decorator.js.map