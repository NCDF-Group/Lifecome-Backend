import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateClinicalServiceDto } from './dto/service-catalogue.dto';
import { ServiceCatalogueService, type ClinicalService } from './service-catalogue.service';

@ApiTags('service-catalogue')
@Controller('clinical-services')
export class ServiceCatalogueController {
  constructor(private readonly catalogue: ServiceCatalogueService) {}

  @Get()
  list(): Promise<ClinicalService[]> {
    return this.catalogue.list();
  }

  @Post()
  create(@Body() body: CreateClinicalServiceDto): Promise<ClinicalService> {
    return this.catalogue.create(body);
  }
}
