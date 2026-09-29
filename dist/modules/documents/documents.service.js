"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DocumentsService", {
    enumerable: true,
    get: function() {
        return DocumentsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
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
let DocumentsService = class DocumentsService {
    constructor(db){
        this.db = db;
    }
    async create(input) {
        const [document] = await this.db.insert(_schema.documents).values(input).returning();
        return document;
    }
    async getById(id) {
        const [document] = await this.db.select().from(_schema.documents).where((0, _drizzleorm.eq)(_schema.documents.id, id));
        if (!document) throw new _appexception.NotFoundAppException('Document');
        return document;
    }
    listForPatient(patientId) {
        return this.db.select().from(_schema.documents).where((0, _drizzleorm.eq)(_schema.documents.patientId, patientId));
    }
    async getSignedDownloadUrl(id) {
        await this.getById(id); // 404s if the document does not exist
        throw new _appexception.NotImplementedAppException('Signed document URLs (no object storage provider is configured yet)');
    }
};
DocumentsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database
    ])
], DocumentsService);

//# sourceMappingURL=documents.service.js.map