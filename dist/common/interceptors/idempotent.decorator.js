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
    get IDEMPOTENT_KEY () {
        return IDEMPOTENT_KEY;
    },
    get Idempotent () {
        return Idempotent;
    }
});
const _common = require("@nestjs/common");
const IDEMPOTENT_KEY = 'idempotent';
const Idempotent = ()=>(0, _common.SetMetadata)(IDEMPOTENT_KEY, true);

//# sourceMappingURL=idempotent.decorator.js.map