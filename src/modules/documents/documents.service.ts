import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { documents } from '../../db/schema';
import { NotFoundAppException, NotImplementedAppException } from '../../common/errors/app-exception';
import type { CreateDocumentDto } from './dto/documents.dto';

export type PatientDocument = typeof documents.$inferSelect;

/**
 * Document metadata only — the file itself lives in object storage (blueprint §7.1: signed
 * short-lived URLs). No storage provider is chosen yet (tech-stack-recommendation §6, "Object
 * storage"), so `getSignedDownloadUrl` is a documented extension point rather than a real
 * implementation.
 */
@Injectable()
export class DocumentsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(input: CreateDocumentDto): Promise<PatientDocument> {
    const [document] = await this.db.insert(documents).values(input).returning();
    return document;
  }

  async getById(id: string): Promise<PatientDocument> {
    const [document] = await this.db.select().from(documents).where(eq(documents.id, id));
    if (!document) throw new NotFoundAppException('Document');
    return document;
  }

  listForPatient(patientId: string): Promise<PatientDocument[]> {
    return this.db.select().from(documents).where(eq(documents.patientId, patientId));
  }

  async getSignedDownloadUrl(id: string): Promise<{ url: string; expiresAt: Date }> {
    await this.getById(id); // 404s if the document does not exist
    throw new NotImplementedAppException('Signed document URLs (no object storage provider is configured yet)');
  }
}
