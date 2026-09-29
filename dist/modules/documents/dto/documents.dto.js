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
    get CreateDocumentDto () {
        return CreateDocumentDto;
    },
    get CreateDocumentSchema () {
        return CreateDocumentSchema;
    }
});
const _zoddto = require("../../../common/validation/zod-dto");
const _zod = require("zod");
const CreateDocumentSchema = _zod.z.object({
    patientId: _zod.z.uuid(),
    encounterId: _zod.z.uuid().optional(),
    documentType: _zod.z.string().min(1).max(100),
    objectKey: _zod.z.string().min(1).max(1000),
    uploadedByProviderId: _zod.z.uuid().optional()
});
let CreateDocumentDto = class CreateDocumentDto extends (0, _zoddto.createZodDto)(CreateDocumentSchema) {
};

//# sourceMappingURL=documents.dto.js.map