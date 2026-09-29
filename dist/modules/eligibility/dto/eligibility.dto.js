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
    get CheckEligibilityDto () {
        return CheckEligibilityDto;
    },
    get CheckEligibilitySchema () {
        return CheckEligibilitySchema;
    },
    get EligibilityStatusSchema () {
        return EligibilityStatusSchema;
    },
    get ListEligibilityChecksQueryDto () {
        return ListEligibilityChecksQueryDto;
    },
    get ListEligibilityChecksQuerySchema () {
        return ListEligibilityChecksQuerySchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _paginationdto = require("../../../common/dto/pagination.dto");
const _zod = require("zod");
const EligibilityStatusSchema = _zod.z.enum([
    'covered',
    'co_pay',
    'pre_authorisation_required',
    'excluded',
    'benefit_limit_reached',
    'payer_unavailable'
]);
const ListEligibilityChecksQuerySchema = _paginationdto.PaginationQuerySchema.extend({
    status: EligibilityStatusSchema.optional()
});
let ListEligibilityChecksQueryDto = class ListEligibilityChecksQueryDto extends (0, _zoddto.createZodDto)(ListEligibilityChecksQuerySchema) {
};
const CheckEligibilitySchema = _zod.z.object({
    membershipId: _zod.z.uuid(),
    clinicalServiceCode: _zod.z.string().min(1)
});
let CheckEligibilityDto = class CheckEligibilityDto extends (0, _zoddto.createZodDto)(CheckEligibilitySchema) {
};

//# sourceMappingURL=eligibility.dto.js.map