import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CareCoordinationService, type CareTask } from './care-coordination.service';
import { CreateCareTaskDto } from './dto/care-coordination.dto';

@ApiTags('care-coordination')
@Controller('care-tasks')
export class CareCoordinationController {
  constructor(private readonly careCoordination: CareCoordinationService) {}

  @Post()
  create(@Body() body: CreateCareTaskDto): Promise<CareTask> {
    return this.careCoordination.create(body);
  }

  @Get('patients/:patientId')
  listForPatient(@Param('patientId', ParseUUIDPipe) patientId: string): Promise<CareTask[]> {
    return this.careCoordination.listForPatient(patientId);
  }

  @Get('providers/:providerId')
  listForProvider(@Param('providerId', ParseUUIDPipe) providerId: string): Promise<CareTask[]> {
    return this.careCoordination.listForProvider(providerId);
  }

  @Post(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string): Promise<CareTask> {
    return this.careCoordination.complete(id);
  }
}
