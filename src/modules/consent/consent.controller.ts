import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConsentService, type ConsentRecord } from './consent.service';
import { GrantConsentDto } from './dto/consent.dto';

@ApiTags('consent')
@Controller('consent')
export class ConsentController {
  constructor(private readonly consent: ConsentService) {}

  @Post()
  grant(@Body() body: GrantConsentDto): Promise<ConsentRecord> {
    return this.consent.grant(body);
  }

  @Post(':id/revoke')
  revoke(@Param('id', ParseUUIDPipe) id: string): Promise<ConsentRecord> {
    return this.consent.revoke(id);
  }

  @Get('patients/:patientId')
  list(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<ConsentRecord[]> {
    return this.consent.list(patientId);
  }
}
