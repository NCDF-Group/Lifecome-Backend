"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ZodValidationPipe", {
    enumerable: true,
    get: function() {
        return ZodValidationPipe;
    }
});
const _common = require("@nestjs/common");
const _zoddto = require("./zod-dto");
const _zodvalidationexception = require("./zod-validation.exception");
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
let ZodValidationPipe = class ZodValidationPipe {
    transform(value, metadata) {
        const { metatype } = metadata;
        if (!(0, _zoddto.isZodDto)(metatype)) {
            return value;
        }
        const result = metatype.schema.safeParse(value);
        if (!result.success) {
            throw new _zodvalidationexception.ZodValidationException(result.error);
        }
        return result.data;
    }
};
ZodValidationPipe = _ts_decorate([
    (0, _common.Injectable)()
], ZodValidationPipe);

//# sourceMappingURL=zod-validation.pipe.js.map