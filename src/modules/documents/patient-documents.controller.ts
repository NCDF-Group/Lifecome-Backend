import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import { DocumentsService, type PatientDocument } from './documents.service';

/**
 * The signed-in patient's documents (medical certificates, referrals, test result PDFs).
 */
@ApiTags('documents')
@UseGuards(PatientAuthGuard)
@Controller('me/documents')
export class PatientDocumentsController {
  constructor(
    private readonly documents: DocumentsService,
    private readonly patients: PatientService,
  ) {}

  @Get()
  async listMyDocuments(@CurrentPatientAccount() account: PatientAccountToken): Promise<PatientDocument[]> {
    const patient = await this.patients.requireProfile(account.sub);
    return this.documents.listForPatient(patient.id);
  }

  @Get(':id')
  async getMyDocument(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PatientDocument> {
    const patient = await this.patients.requireProfile(account.sub);
    const doc = await this.documents.getById(id);
    if (doc.patientId !== patient.id) {
      throw new NotFoundAppException('Document');
    }
    return doc;
  }
}
