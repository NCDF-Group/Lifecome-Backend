import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, RolesGuard } from '../../common/auth/common-auth.module';
import { ListPatientsQueryDto } from './dto/patient.dto';
import { PatientService, type AdminPatientRow } from './patient.service';

/** `/admin/patients` — the "Patients" page in the operations console. */
@ApiTags('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/patients')
export class PatientAdminController {
  constructor(private readonly patients: PatientService) {}

  @Get()
  list(@Query() query: ListPatientsQueryDto) {
    return this.patients.adminList(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminPatientRow> {
    return this.patients.adminGetById(id);
  }
}

export type { AdminPatientRow };
