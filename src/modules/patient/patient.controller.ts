import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreatePatientProfileDto, UpdatePatientProfileDto } from './dto/patient.dto';
import { PatientService, type Patient } from './patient.service';

@ApiTags('patient')
@Controller('patients')
export class PatientController {
  constructor(private readonly patients: PatientService) {}

  /** View 03 — Patient Profile (creation). */
  @Post()
  create(@Body() body: CreatePatientProfileDto): Promise<Patient> {
    return this.patients.createProfile(body);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Patient> {
    return this.patients.getById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdatePatientProfileDto): Promise<Patient> {
    return this.patients.update(id, body);
  }
}
