"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CurrentStaff", {
    enumerable: true,
    get: function() {
        return CurrentStaff;
    }
});
const _common = require("@nestjs/common");
const CurrentStaff = (0, _common.createParamDecorator)((_data, ctx)=>{
    const request = ctx.switchToHttp().getRequest();
    return request.staff;
});

//# sourceMappingURL=current-staff.decorator.js.map