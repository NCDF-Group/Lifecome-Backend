"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentsController", {
    enumerable: true,
    get: function() {
        return DocumentsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _documentsdto = require("./dto/documents.dto");
const _documentsservice = require("./documents.service");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let DocumentsController = class DocumentsController {
    constructor(documents){
        this.documents = documents;
    }
    create(body) {
        return this.documents.create(body);
    }
    get(id) {
        return this.documents.getById(id);
    }
    signedUrl(id) {
        return this.documents.getSignedDownloadUrl(id);
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _documentsdto.CreateDocumentDto === "undefined" ? Object : _documentsdto.CreateDocumentDto
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], DocumentsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], DocumentsController.prototype, "get", null);
_ts_decorate([
    (0, _common.Get)(':id/signed-url'),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", typeof Promise === "undefined" ? Object : Promise)
], DocumentsController.prototype, "signedUrl", null);
DocumentsController = _ts_decorate([
    (0, _swagger.ApiTags)('documents'),
    (0, _common.Controller)('documents'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _documentsservice.DocumentsService === "undefined" ? Object : _documentsservice.DocumentsService
    ])
], DocumentsController);

//# sourceMappingURL=documents.controller.js.map