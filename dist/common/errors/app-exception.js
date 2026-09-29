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
    get AppException () {
        return AppException;
    },
    get CommonErrorCodes () {
        return CommonErrorCodes;
    },
    get NotFoundAppException () {
        return NotFoundAppException;
    },
    get NotImplementedAppException () {
        return NotImplementedAppException;
    }
});
const _common = require("@nestjs/common");
let AppException = class AppException extends _common.HttpException {
    constructor(code, message, status = _common.HttpStatus.BAD_REQUEST){
        super(message, status);
        this.code = code;
    }
};
const CommonErrorCodes = {
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    IDEMPOTENCY_KEY_REQUIRED: 'IDEMPOTENCY_KEY_REQUIRED',
    IDEMPOTENT_REQUEST_IN_PROGRESS: 'IDEMPOTENT_REQUEST_IN_PROGRESS',
    NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
};
let NotFoundAppException = class NotFoundAppException extends AppException {
    constructor(resource){
        super(CommonErrorCodes.NOT_FOUND, `${resource} was not found.`, _common.HttpStatus.NOT_FOUND);
    }
};
let NotImplementedAppException = class NotImplementedAppException extends AppException {
    constructor(what){
        super(CommonErrorCodes.NOT_IMPLEMENTED, `${what} is not implemented in this environment yet.`, _common.HttpStatus.NOT_IMPLEMENTED);
    }
};

//# sourceMappingURL=app-exception.js.map