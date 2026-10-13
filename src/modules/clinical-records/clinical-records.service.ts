import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import {
  carePlans,
  clinicalNotes,
  diagnosticOrders,
  diagnosticResults,
  encounters,
  prescriptions,
  providers,
  referrals,
} from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { AuditService } from '../audit/audit.service';
import type {
  CreateCarePlanDto,
  CreateDiagnosticOrderDto,
  CreateDiagnosticResultDto,
  CreateEncounterDto,
  CreatePrescriptionDto,
  CreateReferralDto,
} from './dto/clinical-records.dto';

export type Encounter = typeof encounters.$inferSelect;
export type ClinicalNote = typeof clinicalNotes.$inferSelect;
export type CarePlan = typeof carePlans.$inferSelect;
export type DiagnosticResult = typeof diagnosticResults.$inferSelect;

/**
 * Encounters, notes, care plans, prescriptions, referrals and diagnostics — the longitudinal
 * record (blueprint §11). The one rule enforced in code, not just convention: a signed note is
 * never updated; `amendNote` always inserts a new row linked via `amendsNoteId`, so the original
 * stays exactly as written (blueprint §11.1).
 */
@Injectable()
export class ClinicalRecordsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly audit: AuditService,
  ) {}

  async createEncounter(input: CreateEncounterDto): Promise<Encounter> {
    const [encounter] = await this.db.insert(encounters).values(input).returning();
    return encounter;
  }

  async getEncounter(id: string): Promise<Encounter> {
    const [encounter] = await this.db.select().from(encounters).where(eq(encounters.id, id));
    if (!encounter) throw new NotFoundAppException('Encounter');
    return encounter;
  }

  async addNote(encounterId: string, authorProviderId: string, body: string): Promise<ClinicalNote> {
    const [note] = await this.db.insert(clinicalNotes).values({ encounterId, authorProviderId, body }).returning();
    return note;
  }

  async signNote(noteId: string, actorProviderId: string): Promise<ClinicalNote> {
    const [note] = await this.db.select().from(clinicalNotes).where(eq(clinicalNotes.id, noteId));
    if (!note) throw new NotFoundAppException('Clinical note');
    if (note.status === 'signed') {
      throw new AppException('NOTE_ALREADY_SIGNED', 'This note has already been signed.', 409);
    }

    const [signed] = await this.db
      .update(clinicalNotes)
      .set({ status: 'signed', signedAt: new Date() })
      .where(eq(clinicalNotes.id, noteId))
      .returning();

    await this.audit.record({
      actorType: 'provider',
      actorId: actorProviderId,
      action: 'clinical_note_signed',
      resourceType: 'clinical_note',
      resourceId: noteId,
    });

    return signed;
  }

  /** Never edits a signed note — inserts a new, linked one instead (blueprint §11.1). */
  async amendNote(originalNoteId: string, authorProviderId: string, body: string): Promise<ClinicalNote> {
    const original = await this.db.select().from(clinicalNotes).where(eq(clinicalNotes.id, originalNoteId));
    if (!original[0]) throw new NotFoundAppException('Clinical note');

    const [amendment] = await this.db
      .insert(clinicalNotes)
      .values({
        encounterId: original[0].encounterId,
        authorProviderId,
        body,
        amendsNoteId: originalNoteId,
        status: 'signed',
        signedAt: new Date(),
      })
      .returning();

    await this.audit.record({
      actorType: 'provider',
      actorId: authorProviderId,
      action: 'clinical_note_amended',
      resourceType: 'clinical_note',
      resourceId: amendment.id,
      metadata: { amendsNoteId: originalNoteId },
    });

    return amendment;
  }

  /** Inserts a new version; does not touch any previous one. */
  async addCarePlan(encounterId: string, input: CreateCarePlanDto): Promise<CarePlan> {
    const [carePlan] = await this.db
      .insert(carePlans)
      .values({
        encounterId,
        summary: input.summary,
        followUpDueAt: input.followUpDueAt ? new Date(input.followUpDueAt) : undefined,
      })
      .returning();
    return carePlan;
  }

  async addPrescription(encounterId: string, input: CreatePrescriptionDto): Promise<typeof prescriptions.$inferSelect> {
    const [prescription] = await this.db.insert(prescriptions).values({ encounterId, ...input }).returning();
    return prescription;
  }

  async addReferral(encounterId: string, input: CreateReferralDto): Promise<typeof referrals.$inferSelect> {
    const [referral] = await this.db.insert(referrals).values({ encounterId, ...input }).returning();
    return referral;
  }

  async addDiagnosticOrder(
    encounterId: string,
    input: CreateDiagnosticOrderDto,
  ): Promise<typeof diagnosticOrders.$inferSelect> {
    const [order] = await this.db.insert(diagnosticOrders).values({ encounterId, ...input }).returning();
    return order;
  }

  async addDiagnosticResult(diagnosticOrderId: string, input: CreateDiagnosticResultDto): Promise<DiagnosticResult> {
    const [result] = await this.db.insert(diagnosticResults).values({ diagnosticOrderId, ...input }).returning();
    return result;
  }

  async reviewDiagnosticResult(resultId: string, reviewedByProviderId: string): Promise<DiagnosticResult> {
    const [updated] = await this.db
      .update(diagnosticResults)
      .set({ reviewStatus: 'reviewed', reviewedByProviderId, reviewedAt: new Date() })
      .where(eq(diagnosticResults.id, resultId))
      .returning();
    if (!updated) throw new NotFoundAppException('Diagnostic result');
    return updated;
  }

  // ---- Patient Records ---------------------------------------------------------------------

  async listEncountersForPatient(patientId: string) {
    return this.db
      .select({
        id: encounters.id,
        appointmentId: encounters.appointmentId,
        patientId: encounters.patientId,
        providerId: encounters.providerId,
        providerName: providers.displayName,
        providerSpecialty: providers.specialty,
        occurredAt: encounters.occurredAt,
      })
      .from(encounters)
      .innerJoin(providers, eq(encounters.providerId, providers.id))
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(encounters.occurredAt));
  }

  async getEncounterDetailForPatient(patientId: string, encounterId: string) {
    const [encounter] = await this.db
      .select({
        id: encounters.id,
        appointmentId: encounters.appointmentId,
        patientId: encounters.patientId,
        providerId: encounters.providerId,
        providerName: providers.displayName,
        providerSpecialty: providers.specialty,
        occurredAt: encounters.occurredAt,
      })
      .from(encounters)
      .innerJoin(providers, eq(encounters.providerId, providers.id))
      .where(and(eq(encounters.id, encounterId), eq(encounters.patientId, patientId)));
    if (!encounter) throw new NotFoundAppException('Encounter');

    const notes = await this.db
      .select()
      .from(clinicalNotes)
      .where(and(eq(clinicalNotes.encounterId, encounterId), eq(clinicalNotes.status, 'signed')));

    const activeCarePlans = await this.db
      .select()
      .from(carePlans)
      .where(eq(carePlans.encounterId, encounterId))
      .orderBy(desc(carePlans.createdAt));

    const encounterPrescriptions = await this.db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.encounterId, encounterId))
      .orderBy(desc(prescriptions.createdAt));

    const encounterReferrals = await this.db
      .select()
      .from(referrals)
      .where(eq(referrals.encounterId, encounterId))
      .orderBy(desc(referrals.createdAt));

    const orders = await this.db
      .select()
      .from(diagnosticOrders)
      .where(eq(diagnosticOrders.encounterId, encounterId));

    return {
      encounter,
      notes,
      carePlans: activeCarePlans,
      prescriptions: encounterPrescriptions,
      referrals: encounterReferrals,
      diagnosticOrders: orders,
    };
  }

  async listCarePlansForPatient(patientId: string) {
    return this.db
      .select({
        id: carePlans.id,
        encounterId: carePlans.encounterId,
        version: carePlans.version,
        status: carePlans.status,
        summary: carePlans.summary,
        followUpDueAt: carePlans.followUpDueAt,
        createdAt: carePlans.createdAt,
        providerName: providers.displayName,
      })
      .from(carePlans)
      .innerJoin(encounters, eq(carePlans.encounterId, encounters.id))
      .innerJoin(providers, eq(encounters.providerId, providers.id))
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(carePlans.createdAt));
  }

  async listPrescriptionsForPatient(patientId: string) {
    return this.db
      .select({
        id: prescriptions.id,
        encounterId: prescriptions.encounterId,
        medicationName: prescriptions.medicationName,
        instructions: prescriptions.instructions,
        createdAt: prescriptions.createdAt,
        prescribedByName: providers.displayName,
      })
      .from(prescriptions)
      .innerJoin(encounters, eq(prescriptions.encounterId, encounters.id))
      .innerJoin(providers, eq(prescriptions.prescribedByProviderId, providers.id))
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async listReferralsForPatient(patientId: string) {
    return this.db
      .select({
        id: referrals.id,
        encounterId: referrals.encounterId,
        reason: referrals.reason,
        referredToDescription: referrals.referredToDescription,
        createdAt: referrals.createdAt,
        referredByName: providers.displayName,
      })
      .from(referrals)
      .innerJoin(encounters, eq(referrals.encounterId, encounters.id))
      .innerJoin(providers, eq(referrals.referredByProviderId, providers.id))
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(referrals.createdAt));
  }

  async listDiagnosticResultsForPatient(patientId: string) {
    return this.db
      .select({
        id: diagnosticResults.id,
        diagnosticOrderId: diagnosticResults.diagnosticOrderId,
        testName: diagnosticOrders.testName,
        originatingProviderName: diagnosticResults.originatingProviderName,
        reviewStatus: diagnosticResults.reviewStatus,
        reviewedAt: diagnosticResults.reviewedAt,
        resultSummary: diagnosticResults.resultSummary,
        receivedAt: diagnosticResults.receivedAt,
      })
      .from(diagnosticResults)
      .innerJoin(diagnosticOrders, eq(diagnosticResults.diagnosticOrderId, diagnosticOrders.id))
      .innerJoin(encounters, eq(diagnosticOrders.encounterId, encounters.id))
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(diagnosticResults.receivedAt));
  }

  async getConsolidatedRecordsForPatient(patientId: string) {
    const [encs, plans, rxs, refs, results] = await Promise.all([
      this.listEncountersForPatient(patientId),
      this.listCarePlansForPatient(patientId),
      this.listPrescriptionsForPatient(patientId),
      this.listReferralsForPatient(patientId),
      this.listDiagnosticResultsForPatient(patientId),
    ]);
    return {
      encounters: encs,
      carePlans: plans,
      prescriptions: rxs,
      referrals: refs,
      diagnosticResults: results,
    };
  }
}
