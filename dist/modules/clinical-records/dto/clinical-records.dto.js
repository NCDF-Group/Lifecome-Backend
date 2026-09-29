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
    get AmendClinicalNoteDto () {
        return AmendClinicalNoteDto;
    },
    get AmendClinicalNoteSchema () {
        return AmendClinicalNoteSchema;
    },
    get CreateCarePlanDto () {
        return CreateCarePlanDto;
    },
    get CreateCarePlanSchema () {
        return CreateCarePlanSchema;
    },
    get CreateClinicalNoteDto () {
        return CreateClinicalNoteDto;
    },
    get CreateClinicalNoteSchema () {
        return CreateClinicalNoteSchema;
    },
    get CreateDiagnosticOrderDto () {
        return CreateDiagnosticOrderDto;
    },
    get CreateDiagnosticOrderSchema () {
        return CreateDiagnosticOrderSchema;
    },
    get CreateDiagnosticResultDto () {
        return CreateDiagnosticResultDto;
    },
    get CreateDiagnosticResultSchema () {
        return CreateDiagnosticResultSchema;
    },
    get CreateEncounterDto () {
        return CreateEncounterDto;
    },
    get CreateEncounterSchema () {
        return CreateEncounterSchema;
    },
    get CreatePrescriptionDto () {
        return CreatePrescriptionDto;
    },
    get CreatePrescriptionSchema () {
        return CreatePrescriptionSchema;
    },
    get CreateReferralDto () {
        return CreateReferralDto;
    },
    get CreateReferralSchema () {
        return CreateReferralSchema;
    },
    get ReviewDiagnosticResultDto () {
        return ReviewDiagnosticResultDto;
    },
    get ReviewDiagnosticResultSchema () {
        return ReviewDiagnosticResultSchema;
    },
    get SignClinicalNoteDto () {
        return SignClinicalNoteDto;
    },
    get SignClinicalNoteSchema () {
        return SignClinicalNoteSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateEncounterSchema = _zod.z.object({
    appointmentId: _zod.z.uuid(),
    patientId: _zod.z.uuid(),
    providerId: _zod.z.uuid()
});
let CreateEncounterDto = class CreateEncounterDto extends (0, _zoddto.createZodDto)(CreateEncounterSchema) {
};
const CreateClinicalNoteSchema = _zod.z.object({
    authorProviderId: _zod.z.uuid(),
    body: _zod.z.string().min(1).max(20_000)
});
let CreateClinicalNoteDto = class CreateClinicalNoteDto extends (0, _zoddto.createZodDto)(CreateClinicalNoteSchema) {
};
const SignClinicalNoteSchema = _zod.z.object({
    authorProviderId: _zod.z.uuid()
});
let SignClinicalNoteDto = class SignClinicalNoteDto extends (0, _zoddto.createZodDto)(SignClinicalNoteSchema) {
};
const AmendClinicalNoteSchema = _zod.z.object({
    authorProviderId: _zod.z.uuid(),
    body: _zod.z.string().min(1).max(20_000)
});
let AmendClinicalNoteDto = class AmendClinicalNoteDto extends (0, _zoddto.createZodDto)(AmendClinicalNoteSchema) {
};
const CreateCarePlanSchema = _zod.z.object({
    summary: _zod.z.string().min(1).max(10_000),
    followUpDueAt: _zod.z.iso.datetime().optional()
});
let CreateCarePlanDto = class CreateCarePlanDto extends (0, _zoddto.createZodDto)(CreateCarePlanSchema) {
};
const CreatePrescriptionSchema = _zod.z.object({
    prescribedByProviderId: _zod.z.uuid(),
    medicationName: _zod.z.string().min(1).max(300),
    instructions: _zod.z.string().min(1).max(2000)
});
let CreatePrescriptionDto = class CreatePrescriptionDto extends (0, _zoddto.createZodDto)(CreatePrescriptionSchema) {
};
const CreateReferralSchema = _zod.z.object({
    referredByProviderId: _zod.z.uuid(),
    reason: _zod.z.string().min(1).max(2000),
    referredToDescription: _zod.z.string().min(1).max(500)
});
let CreateReferralDto = class CreateReferralDto extends (0, _zoddto.createZodDto)(CreateReferralSchema) {
};
const CreateDiagnosticOrderSchema = _zod.z.object({
    orderedByProviderId: _zod.z.uuid(),
    testName: _zod.z.string().min(1).max(300)
});
let CreateDiagnosticOrderDto = class CreateDiagnosticOrderDto extends (0, _zoddto.createZodDto)(CreateDiagnosticOrderSchema) {
};
const CreateDiagnosticResultSchema = _zod.z.object({
    originatingProviderName: _zod.z.string().min(1).max(300),
    resultSummary: _zod.z.string().max(10_000).optional()
});
let CreateDiagnosticResultDto = class CreateDiagnosticResultDto extends (0, _zoddto.createZodDto)(CreateDiagnosticResultSchema) {
};
const ReviewDiagnosticResultSchema = _zod.z.object({
    reviewedByProviderId: _zod.z.uuid()
});
let ReviewDiagnosticResultDto = class ReviewDiagnosticResultDto extends (0, _zoddto.createZodDto)(ReviewDiagnosticResultSchema) {
};

//# sourceMappingURL=clinical-records.dto.js.map