import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { CreateDocumentDto } from './dto/documents.dto';
import { DocumentsService, type PatientDocument } from './documents.service';

@ApiTags('documents')
// Staff only until object storage and patient-side upload are designed - see DocumentsService.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('platform_administrator', 'clinical_administrator', 'clinician')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  create(@Body() body: CreateDocumentDto): Promise<PatientDocument> {
    return this.documents.create(body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<PatientDocument> {
    return this.documents.getById(id);
  }

  @Get(':id/signed-url')
  signedUrl(@Param('id', ParseUUIDPipe) id: string): Promise<{ url: string; expiresAt: Date }> {
    return this.documents.getSignedDownloadUrl(id);
  }
}
