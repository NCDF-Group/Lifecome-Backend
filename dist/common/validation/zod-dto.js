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
    get createZodDto () {
        return createZodDto;
    },
    get isZodDto () {
        return isZodDto;
    }
});
function createZodDto(schema) {
    let AugmentedZodDto = class AugmentedZodDto {
        static{
            this.isZodDto = true;
        }
        static{
            this.schema = schema;
        }
        constructor(partial = {}){
            Object.assign(this, partial);
        }
    };
    return AugmentedZodDto;
}
function isZodDto(metatype) {
    return typeof metatype === 'function' && 'isZodDto' in metatype && metatype.isZodDto === true;
}

//# sourceMappingURL=zod-dto.js.map