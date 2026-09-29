import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateSlotDto, HoldSlotDto } from './dto/scheduling.dto';
import { SchedulingService, type AvailabilitySlot } from './scheduling.service';

@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  /** View 13 — Choose Appointment Time. */
  @Get('providers/:providerId/availability')
  listAvailable(@Param('providerId', ParseUUIDPipe) providerId: string): Promise<AvailabilitySlot[]> {
    return this.scheduling.listAvailable(providerId);
  }

  @Post('slots')
  createSlot(@Body() body: CreateSlotDto): Promise<AvailabilitySlot> {
    return this.scheduling.createSlot(body);
  }

  @Post('slots/hold')
  hold(@Body() body: HoldSlotDto): Promise<AvailabilitySlot> {
    return this.scheduling.holdSlot(body.slotId);
  }
}
