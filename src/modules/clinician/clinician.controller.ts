import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentStaff, JwtAuthGuard, Roles, RolesGuard, type StaffTokenPayload } from '../../common/auth/common-auth.module';
import { ClinicianService } from './clinician.service';
import { ClinicianAppointmentsQueryDto, ClinicianCreateSlotDto } from './dto/clinician.dto';

/** `/clinician` - the doctor's own workspace in the operations console. Clinician accounts only. */
@ApiTags('clinician')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('clinician')
@Controller('clinician')
export class ClinicianController {
  constructor(private readonly clinician: ClinicianService) {}

  @Get('me')
  me(@CurrentStaff() staff: StaffTokenPayload) {
    return this.clinician.me(staff.sub);
  }

  @Get('appointments')
  appointments(@CurrentStaff() staff: StaffTokenPayload, @Query() query: ClinicianAppointmentsQueryDto) {
    return this.clinician.listAppointments(staff.sub, query);
  }

  @Get('appointments/:id')
  appointment(@CurrentStaff() staff: StaffTokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.clinician.getAppointment(staff.sub, id);
  }

  @Get('availability')
  availability(@CurrentStaff() staff: StaffTokenPayload) {
    return this.clinician.listSlots(staff.sub);
  }

  @Post('availability')
  addSlot(@CurrentStaff() staff: StaffTokenPayload, @Body() body: ClinicianCreateSlotDto) {
    return this.clinician.createSlot(staff.sub, body);
  }

  @Delete('availability/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSlot(@CurrentStaff() staff: StaffTokenPayload, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.clinician.deleteSlot(staff.sub, id);
  }
}
