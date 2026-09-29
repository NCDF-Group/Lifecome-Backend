"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PayerAdapterRegistry", {
    enumerable: true,
    get: function() {
        return PayerAdapterRegistry;
    }
});
const _common = require("@nestjs/common");
const _appexception = require("../../../common/errors/app-exception");
const _fakepayeradapter = require("./fake-payer.adapter");
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
let PayerAdapterRegistry = class PayerAdapterRegistry {
    register(adapter) {
        this.adapters.set(adapter.payerCode, adapter);
    }
    get(payerCode) {
        const adapter = this.adapters.get(payerCode);
        if (!adapter) {
            throw new _appexception.AppException('PAYER_ADAPTER_NOT_CONFIGURED', 'This payer is not yet connected. Please pay directly, or try again later.', 502);
        }
        return adapter;
    }
    constructor(fakePayerAdapter){
        this.adapters = new Map();
        this.register(fakePayerAdapter);
    }
};
PayerAdapterRegistry = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _fakepayeradapter.FakePayerAdapter === "undefined" ? Object : _fakepayeradapter.FakePayerAdapter
    ])
], PayerAdapterRegistry);

//# sourceMappingURL=payer-adapter.registry.js.map