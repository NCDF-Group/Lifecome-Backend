"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FakePayerAdapter", {
    enumerable: true,
    get: function() {
        return FakePayerAdapter;
    }
});
const _nodecrypto = require("node:crypto");
const _common = require("@nestjs/common");
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
let FakePayerAdapter = class FakePayerAdapter {
    // These are synchronous under the hood (no network call to fake), but the interface is async
    // because every real adapter's implementation will be — hence `Promise.resolve(...)` rather
    // than `async`/`await` with nothing to actually await.
    verifyMember(input) {
        if (input.memberId.trim().length === 0) {
            return Promise.resolve({
                status: 'not_found'
            });
        }
        // A member id ending in the digit 9 exercises the "needs manual review" state.
        if (input.memberId.endsWith('9')) {
            return Promise.resolve({
                status: 'manual_review'
            });
        }
        return Promise.resolve({
            status: 'verified',
            planId: 'FAKE-STANDARD'
        });
    }
    checkEligibility(input) {
        if (input.clinicalServiceCode === 'SPECIALIST') {
            return Promise.resolve({
                status: 'pre_authorisation_required'
            });
        }
        if (input.clinicalServiceCode === 'COSMETIC') {
            return Promise.resolve({
                status: 'excluded'
            });
        }
        return Promise.resolve({
            status: 'covered'
        });
    }
    requestAuthorisation(_input) {
        const payerReference = `FAKE-AUTH-${(0, _nodecrypto.randomUUID)().slice(0, 8).toUpperCase()}`;
        const result = {
            status: 'approved',
            payerReference
        };
        this.authorisations.set(payerReference, result);
        return Promise.resolve({
            status: 'approved',
            payerReference
        });
    }
    getAuthorisationStatus(payerReference) {
        return Promise.resolve(this.authorisations.get(payerReference) ?? {
            status: 'expired'
        });
    }
    constructor(){
        this.payerCode = 'FAKE_HMO';
        this.authorisations = new Map();
    }
};
FakePayerAdapter = _ts_decorate([
    (0, _common.Injectable)()
], FakePayerAdapter);

//# sourceMappingURL=fake-payer.adapter.js.map