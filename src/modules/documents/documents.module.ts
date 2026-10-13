import { Module } from '@nestjs/common';

import { PatientModule } from '../patient/patient.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PatientDocumentsController } from './patient-documents.controller';

@Module({
  imports: [PatientModule],
  controllers: [DocumentsController, PatientDocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
