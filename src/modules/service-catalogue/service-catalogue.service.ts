import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../../db/client';
import { clinicalServices } from '../../db/schema';
import { NotFoundAppException } from '../../common/errors/app-exception';
import type { CreateClinicalServiceDto } from './dto/service-catalogue.dto';

export type ClinicalService = typeof clinicalServices.$inferSelect;

/** View 10 — Choose a Service. */
@Injectable()
export class ServiceCatalogueService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  list(): Promise<ClinicalService[]> {
    return this.db.select().from(clinicalServices).where(eq(clinicalServices.isActive, true));
  }

  async getByCode(code: string): Promise<ClinicalService> {
    const [service] = await this.db.select().from(clinicalServices).where(eq(clinicalServices.code, code));
    if (!service) throw new NotFoundAppException('Clinical service');
    return service;
  }

  async create(input: CreateClinicalServiceDto): Promise<ClinicalService> {
    const [created] = await this.db.insert(clinicalServices).values(input).returning();
    return created;
  }
}
