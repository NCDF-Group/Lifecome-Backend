"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClinicalRecordsService", {
    enumerable: true,
    get: function() {
        return ClinicalRecordsService;
    }
});
const _common = require("@nestjs/common");
const _drizzleorm = require("drizzle-orm");
const _client = require("../../db/client");
const _schema = require("../../db/schema");
const _appexception = require("../../common/errors/app-exception");
const _auditservice = require("../audit/audit.service");
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
let ClinicalRecordsService = class ClinicalRecordsService {
    async createEncounter(input) {
        const [encounter] = await this.db.insert(_schema.encounters).values(input).returning();
        return encounter;
    }
    async getEncounter(id) {
        const [encounter] = await this.db.select().from(_schema.encounters).where((0, _drizzleorm.eq)(_schema.encounters.id, id));
        if (!encounter) throw new _appexception.NotFoundAppException('Encounter');
        return encounter;
    }
    async addNote(encounterId, authorProviderId, body) {
        const [note] = await this.db.insert(_schema.clinicalNotes).values({
            encounterId,
            authorProviderId,
            body
        }).returning();
        return note;
    }
    async signNote(noteId, actorProviderId) {
        const [note] = await this.db.select().from(_schema.clinicalNotes).where((0, _drizzleorm.eq)(_schema.clinicalNotes.id, noteId));
        if (!note) throw new _appexception.NotFoundAppException('Clinical note');
        if (note.status === 'signed') {
            throw new _appexception.AppException('NOTE_ALREADY_SIGNED', 'This note has already been signed.', 409);
        }
        const [signed] = await this.db.update(_schema.clinicalNotes).set({
            status: 'signed',
            signedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.clinicalNotes.id, noteId)).returning();
        await this.audit.record({
            actorType: 'provider',
            actorId: actorProviderId,
            action: 'clinical_note_signed',
            resourceType: 'clinical_note',
            resourceId: noteId
        });
        return signed;
    }
    /** Never edits a signed note — inserts a new, linked one instead (blueprint §11.1). */ async amendNote(originalNoteId, authorProviderId, body) {
        const original = await this.db.select().from(_schema.clinicalNotes).where((0, _drizzleorm.eq)(_schema.clinicalNotes.id, originalNoteId));
        if (!original[0]) throw new _appexception.NotFoundAppException('Clinical note');
        const [amendment] = await this.db.insert(_schema.clinicalNotes).values({
            encounterId: original[0].encounterId,
            authorProviderId,
            body,
            amendsNoteId: originalNoteId,
            status: 'signed',
            signedAt: new Date()
        }).returning();
        await this.audit.record({
            actorType: 'provider',
            actorId: authorProviderId,
            action: 'clinical_note_amended',
            resourceType: 'clinical_note',
            resourceId: amendment.id,
            metadata: {
                amendsNoteId: originalNoteId
            }
        });
        return amendment;
    }
    /** Inserts a new version; does not touch any previous one. */ async addCarePlan(encounterId, input) {
        const [carePlan] = await this.db.insert(_schema.carePlans).values({
            encounterId,
            summary: input.summary,
            followUpDueAt: input.followUpDueAt ? new Date(input.followUpDueAt) : undefined
        }).returning();
        return carePlan;
    }
    async addPrescription(encounterId, input) {
        const [prescription] = await this.db.insert(_schema.prescriptions).values({
            encounterId,
            ...input
        }).returning();
        return prescription;
    }
    async addReferral(encounterId, input) {
        const [referral] = await this.db.insert(_schema.referrals).values({
            encounterId,
            ...input
        }).returning();
        return referral;
    }
    async addDiagnosticOrder(encounterId, input) {
        const [order] = await this.db.insert(_schema.diagnosticOrders).values({
            encounterId,
            ...input
        }).returning();
        return order;
    }
    async addDiagnosticResult(diagnosticOrderId, input) {
        const [result] = await this.db.insert(_schema.diagnosticResults).values({
            diagnosticOrderId,
            ...input
        }).returning();
        return result;
    }
    async reviewDiagnosticResult(resultId, reviewedByProviderId) {
        const [updated] = await this.db.update(_schema.diagnosticResults).set({
            reviewStatus: 'reviewed',
            reviewedByProviderId,
            reviewedAt: new Date()
        }).where((0, _drizzleorm.eq)(_schema.diagnosticResults.id, resultId)).returning();
        if (!updated) throw new _appexception.NotFoundAppException('Diagnostic result');
        return updated;
    }
    // ---- Patient Records ---------------------------------------------------------------------
    async listEncountersForPatient(patientId) {
        return this.db.select({
            id: _schema.encounters.id,
            appointmentId: _schema.encounters.appointmentId,
            patientId: _schema.encounters.patientId,
            providerId: _schema.encounters.providerId,
            providerName: _schema.providers.displayName,
            providerSpecialty: _schema.providers.specialty,
            occurredAt: _schema.encounters.occurredAt
        }).from(_schema.encounters).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.encounters.providerId, _schema.providers.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)).orderBy((0, _drizzleorm.desc)(_schema.encounters.occurredAt));
    }
    async getEncounterDetailForPatient(patientId, encounterId) {
        const [encounter] = await this.db.select({
            id: _schema.encounters.id,
            appointmentId: _schema.encounters.appointmentId,
            patientId: _schema.encounters.patientId,
            providerId: _schema.encounters.providerId,
            providerName: _schema.providers.displayName,
            providerSpecialty: _schema.providers.specialty,
            occurredAt: _schema.encounters.occurredAt
        }).from(_schema.encounters).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.encounters.providerId, _schema.providers.id)).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.encounters.id, encounterId), (0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)));
        if (!encounter) throw new _appexception.NotFoundAppException('Encounter');
        const notes = await this.db.select().from(_schema.clinicalNotes).where((0, _drizzleorm.and)((0, _drizzleorm.eq)(_schema.clinicalNotes.encounterId, encounterId), (0, _drizzleorm.eq)(_schema.clinicalNotes.status, 'signed')));
        const activeCarePlans = await this.db.select().from(_schema.carePlans).where((0, _drizzleorm.eq)(_schema.carePlans.encounterId, encounterId)).orderBy((0, _drizzleorm.desc)(_schema.carePlans.createdAt));
        const encounterPrescriptions = await this.db.select().from(_schema.prescriptions).where((0, _drizzleorm.eq)(_schema.prescriptions.encounterId, encounterId)).orderBy((0, _drizzleorm.desc)(_schema.prescriptions.createdAt));
        const encounterReferrals = await this.db.select().from(_schema.referrals).where((0, _drizzleorm.eq)(_schema.referrals.encounterId, encounterId)).orderBy((0, _drizzleorm.desc)(_schema.referrals.createdAt));
        const orders = await this.db.select().from(_schema.diagnosticOrders).where((0, _drizzleorm.eq)(_schema.diagnosticOrders.encounterId, encounterId));
        return {
            encounter,
            notes,
            carePlans: activeCarePlans,
            prescriptions: encounterPrescriptions,
            referrals: encounterReferrals,
            diagnosticOrders: orders
        };
    }
    async listCarePlansForPatient(patientId) {
        return this.db.select({
            id: _schema.carePlans.id,
            encounterId: _schema.carePlans.encounterId,
            version: _schema.carePlans.version,
            status: _schema.carePlans.status,
            summary: _schema.carePlans.summary,
            followUpDueAt: _schema.carePlans.followUpDueAt,
            createdAt: _schema.carePlans.createdAt,
            providerName: _schema.providers.displayName
        }).from(_schema.carePlans).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.carePlans.encounterId, _schema.encounters.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.encounters.providerId, _schema.providers.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)).orderBy((0, _drizzleorm.desc)(_schema.carePlans.createdAt));
    }
    async listPrescriptionsForPatient(patientId) {
        return this.db.select({
            id: _schema.prescriptions.id,
            encounterId: _schema.prescriptions.encounterId,
            medicationName: _schema.prescriptions.medicationName,
            instructions: _schema.prescriptions.instructions,
            createdAt: _schema.prescriptions.createdAt,
            prescribedByName: _schema.providers.displayName
        }).from(_schema.prescriptions).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.prescriptions.encounterId, _schema.encounters.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.prescriptions.prescribedByProviderId, _schema.providers.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)).orderBy((0, _drizzleorm.desc)(_schema.prescriptions.createdAt));
    }
    async listReferralsForPatient(patientId) {
        return this.db.select({
            id: _schema.referrals.id,
            encounterId: _schema.referrals.encounterId,
            reason: _schema.referrals.reason,
            referredToDescription: _schema.referrals.referredToDescription,
            createdAt: _schema.referrals.createdAt,
            referredByName: _schema.providers.displayName
        }).from(_schema.referrals).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.referrals.encounterId, _schema.encounters.id)).innerJoin(_schema.providers, (0, _drizzleorm.eq)(_schema.referrals.referredByProviderId, _schema.providers.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)).orderBy((0, _drizzleorm.desc)(_schema.referrals.createdAt));
    }
    async listDiagnosticResultsForPatient(patientId) {
        return this.db.select({
            id: _schema.diagnosticResults.id,
            diagnosticOrderId: _schema.diagnosticResults.diagnosticOrderId,
            testName: _schema.diagnosticOrders.testName,
            originatingProviderName: _schema.diagnosticResults.originatingProviderName,
            reviewStatus: _schema.diagnosticResults.reviewStatus,
            reviewedAt: _schema.diagnosticResults.reviewedAt,
            resultSummary: _schema.diagnosticResults.resultSummary,
            receivedAt: _schema.diagnosticResults.receivedAt
        }).from(_schema.diagnosticResults).innerJoin(_schema.diagnosticOrders, (0, _drizzleorm.eq)(_schema.diagnosticResults.diagnosticOrderId, _schema.diagnosticOrders.id)).innerJoin(_schema.encounters, (0, _drizzleorm.eq)(_schema.diagnosticOrders.encounterId, _schema.encounters.id)).where((0, _drizzleorm.eq)(_schema.encounters.patientId, patientId)).orderBy((0, _drizzleorm.desc)(_schema.diagnosticResults.receivedAt));
    }
    async getConsolidatedRecordsForPatient(patientId) {
        const [encs, plans, rxs, refs, results] = await Promise.all([
            this.listEncountersForPatient(patientId),
            this.listCarePlansForPatient(patientId),
            this.listPrescriptionsForPatient(patientId),
            this.listReferralsForPatient(patientId),
            this.listDiagnosticResultsForPatient(patientId)
        ]);
        return {
            encounters: encs,
            carePlans: plans,
            prescriptions: rxs,
            referrals: refs,
            diagnosticResults: results
        };
    }
    constructor(db, audit){
        this.db = db;
        this.audit = audit;
    }
};
ClinicalRecordsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _common.Inject)(_client.DRIZZLE)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Database === "undefined" ? Object : Database,
        typeof _auditservice.AuditService === "undefined" ? Object : _auditservice.AuditService
    ])
], ClinicalRecordsService);

//# sourceMappingURL=clinical-records.service.js.map