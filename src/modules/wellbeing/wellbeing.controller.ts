import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { BookWellbeingSessionDto } from './dto/wellbeing.dto';
import { WellbeingService } from './wellbeing.service';

@ApiTags('wellbeing')
@Controller('wellbeing')
export class WellbeingController {
  constructor(private readonly wellbeing: WellbeingService) {}

  /** Wellbeing service hub summary (W01). */
  @Get('hub')
  getHub() {
    return this.wellbeing.getHub();
  }

  /** Authenticated wellbeing service hub with user booking counts. */
  @UseGuards(PatientAuthGuard)
  @Get('hub/me')
  getMyHub(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.wellbeing.getHub(account.sub);
  }

  /** The 3 approved wellbeing session types catalogue. */
  @Get('sessions/catalogue')
  getSessionCatalogue() {
    return this.wellbeing.getSessionCatalogue();
  }

  /** Book a wellbeing session. */
  @UseGuards(PatientAuthGuard)
  @Post('sessions/book')
  bookSession(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: BookWellbeingSessionDto,
  ) {
    return this.wellbeing.bookSession(account.sub, body);
  }

  /** List patient's booked wellbeing sessions. */
  @UseGuards(PatientAuthGuard)
  @Get('sessions')
  listMySessions(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.wellbeing.listMySessions(account.sub);
  }

  /** Cancel a booked wellbeing session. */
  @UseGuards(PatientAuthGuard)
  @Post('sessions/:id/cancel')
  cancelSession(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.wellbeing.cancelSession(account.sub, id);
  }
}
