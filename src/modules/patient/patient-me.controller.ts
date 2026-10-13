import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentPatientAccount, PatientAuthGuard, type PatientAccountToken } from '../../common/auth/common-auth.module';
import { UploadAvatarDto } from '../../common/dto/avatar.dto';
import { CreateDependantDto, PatchMyProfileDto, UpdateDependantDto, UpsertMyProfileDto } from './dto/patient.dto';
import { PatientService, type Dependant, type MeResponse, type Patient } from './patient.service';

/**
 * `/me` - everything the signed-in patient can do with their own account and profile. The patient is
 * always taken from the session token, never from a URL or body, so there is no way to name (and so
 * read or change) somebody else's data.
 */
@ApiTags('patient')
@UseGuards(PatientAuthGuard)
@Controller('me')
export class PatientMeController {
  constructor(private readonly patients: PatientService) {}

  @Get()
  me(@CurrentPatientAccount() account: PatientAccountToken): Promise<MeResponse> {
    return this.patients.getMe(account.sub);
  }

  /** View 04 — Patient Dashboard aggregated summary for web and mobile clients. */
  @Get('dashboard')
  dashboard(@CurrentPatientAccount() account: PatientAccountToken) {
    return this.patients.getDashboard(account.sub);
  }

  /** Create (first call) or replace the profile. Called once at the end of sign-up. */
  @Put('profile')
  upsertProfile(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: UpsertMyProfileDto): Promise<Patient> {
    return this.patients.upsertMyProfile(account.sub, body);
  }

  @Patch('profile')
  patchProfile(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: PatchMyProfileDto): Promise<Patient> {
    return this.patients.patchMyProfile(account.sub, body);
  }

  @Put('avatar')
  setAvatar(@CurrentPatientAccount() account: PatientAccountToken, @Body() body: UploadAvatarDto): Promise<Patient> {
    return this.patients.setMyAvatar(account.sub, body);
  }

  @Delete('avatar')
  removeAvatar(@CurrentPatientAccount() account: PatientAccountToken): Promise<Patient> {
    return this.patients.removeMyAvatar(account.sub);
  }

  @Get('avatar')
  async avatar(@CurrentPatientAccount() account: PatientAccountToken): Promise<StreamableFile> {
    const avatar = await this.patients.getMyAvatar(account.sub);
    return new StreamableFile(avatar.image, { type: avatar.contentType, length: avatar.image.length });
  }

  // ---- Dependants --------------------------------------------------------------------------

  @Get('dependants')
  listDependants(@CurrentPatientAccount() account: PatientAccountToken): Promise<Dependant[]> {
    return this.patients.listDependants(account.sub);
  }

  @Post('dependants')
  createDependant(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Body() body: CreateDependantDto,
  ): Promise<Dependant> {
    return this.patients.createDependant(account.sub, body);
  }

  @Patch('dependants/:id')
  updateDependant(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDependantDto,
  ): Promise<Dependant> {
    return this.patients.updateDependant(account.sub, id, body);
  }

  @Delete('dependants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDependant(
    @CurrentPatientAccount() account: PatientAccountToken,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.patients.deleteDependant(account.sub, id);
  }
}
