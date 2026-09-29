import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateProviderDto, ListProvidersQueryDto } from './dto/provider.dto';
import { ProviderDirectoryService, type Provider } from './provider-directory.service';

@ApiTags('provider-directory')
@Controller('providers')
export class ProviderDirectoryController {
  constructor(private readonly directory: ProviderDirectoryService) {}

  /** View 11 — Find a Doctor. */
  @Get()
  list(@Query() query: ListProvidersQueryDto): Promise<Provider[]> {
    return this.directory.list({ specialty: query.specialty });
  }

  /** View 12 — Doctor Profile. */
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Provider> {
    return this.directory.getById(id);
  }

  /** Provider onboarding (operations console, once built). */
  @Post()
  create(@Body() body: CreateProviderDto): Promise<Provider> {
    return this.directory.create(body);
  }
}
