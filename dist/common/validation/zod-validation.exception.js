"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ZodValidationException", {
    enumerable: true,
    get: function() {
        return ZodValidationException;
    }
});
let ZodValidationException = class ZodValidationException extends Error {
    getZodError() {
        return this.zodError;
    }
    constructor(zodError){
        super('Validation failed'), this.zodError = zodError;
        this.name = 'ZodValidationException';
    }
};

//# sourceMappingURL=zod-validation.exception.js.map