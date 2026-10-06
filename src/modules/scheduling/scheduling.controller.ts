import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, PatientAuthGuard, Roles, RolesGuard } from '../../common/auth/common-auth.module';
import { CreateSlotDto, HoldSlotDto } from './dto/scheduling.dto';
import { SchedulingService, type AvailabilitySlot } from './scheduling.service';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  /** View 13 — Choose Appointment Time. */
  @UseGuards(PatientAuthGuard)
  @Get('providers/:providerId/availability')
  listAvailable(@Param('providerId', ParseUUIDPipe) providerId: string): Promise<AvailabilitySlot[]> {
    return this.scheduling.listAvailable(providerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_administrator', 'clinical_administrator')
  @Post('slots')
  createSlot(@Body() body: CreateSlotDto): Promise<AvailabilitySlot> {
    return this.scheduling.createSlot(body);
  }

  @UseGuards(PatientAuthGuard)
  @Post('slots/hold')
  hold(@Body() body: HoldSlotDto): Promise<AvailabilitySlot> {
    return this.scheduling.holdSlot(body.slotId);
  }
}
