import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { ListProvidersAdminQueryDto, UpdateProviderNetworkStatusDto } from './dto/provider.dto';
import { ProviderDirectoryService, type Provider } from './provider-directory.service';

/** `/admin/providers` — the "Providers" page in the operations console. Unlike the public
 * `/providers` endpoint, this includes suspended and pending-review providers. */
@ApiTags('provider-directory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/providers')
export class ProviderAdminController {
  constructor(private readonly directory: ProviderDirectoryService) {}

  @Get()
  list(@Query() query: ListProvidersAdminQueryDto) {
    return this.directory.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Provider> {
    return this.directory.getById(id);
  }

  @Roles('platform_administrator', 'clinical_administrator')
  @Patch(':id/network-status')
  updateNetworkStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProviderNetworkStatusDto,
  ): Promise<Provider> {
    return this.directory.setNetworkStatus(id, body.networkStatus);
  }
}
