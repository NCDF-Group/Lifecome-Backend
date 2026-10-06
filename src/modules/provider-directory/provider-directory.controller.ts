import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, PatientAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { CreateProviderDto, ListProvidersQueryDto } from './dto/provider.dto';
import { ProviderDirectoryService, type Provider } from './provider-directory.service';

@ApiTags('provider-directory')
@Controller('providers')
export class ProviderDirectoryController {
  constructor(private readonly directory: ProviderDirectoryService) {}

  /** View 11 — Find a Doctor. */
  @UseGuards(PatientAuthGuard)
  @Get()
  list(@Query() query: ListProvidersQueryDto): Promise<Provider[]> {
    return this.directory.list({ specialty: query.specialty });
  }

  /** View 12 — Doctor Profile. */
  @UseGuards(PatientAuthGuard)
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Provider> {
    return this.directory.getById(id);
  }

  /** Provider onboarding - operations console staff only. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_administrator', 'clinical_administrator')
  @Post()
  create(@Body() body: CreateProviderDto): Promise<Provider> {
    return this.directory.create(body);
  }
}
