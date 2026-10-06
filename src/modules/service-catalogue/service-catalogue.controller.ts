import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, PatientAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { CreateClinicalServiceDto } from './dto/service-catalogue.dto';
import { ServiceCatalogueService, type ClinicalService } from './service-catalogue.service';

@ApiTags('service-catalogue')
@Controller('clinical-services')
export class ServiceCatalogueController {
  constructor(private readonly catalogue: ServiceCatalogueService) {}

  @UseGuards(PatientAuthGuard)
  @Get()
  list(): Promise<ClinicalService[]> {
    return this.catalogue.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_administrator')
  @Post()
  create(@Body() body: CreateClinicalServiceDto): Promise<ClinicalService> {
    return this.catalogue.create(body);
  }
}
