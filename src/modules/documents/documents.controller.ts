import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateDocumentDto } from './dto/documents.dto';
import { DocumentsService, type PatientDocument } from './documents.service';

@ApiTags('documents')
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
