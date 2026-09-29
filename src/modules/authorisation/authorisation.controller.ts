import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Idempotent } from '../../common/interceptors/idempotent.decorator';
import { AuthorisationService, type Authorisation } from './authorisation.service';
import { RequestAuthorisationDto } from './dto/authorisation.dto';

@ApiTags('authorisation')
@Controller('authorisations')
export class AuthorisationController {
  constructor(private readonly authorisationService: AuthorisationService) {}

  @Post()
  @Idempotent()
  request(@Body() body: RequestAuthorisationDto): Promise<Authorisation> {
    return this.authorisationService.request(body);
  }

  @Get(':id')
  status(@Param('id', ParseUUIDPipe) id: string): Promise<Authorisation> {
    return this.authorisationService.refreshStatus(id);
  }
}
