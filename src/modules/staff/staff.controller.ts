import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentStaff, JwtAuthGuard, Roles, RolesGuard, type StaffTokenPayload } from '../../common/auth/common-auth.module';
import {
  ChangeOwnPasswordDto,
  CreateStaffDto,
  ListStaffQueryDto,
  UpdateOwnProfileDto,
  UpdateStaffDto,
  UploadAvatarDto,
} from './dto/staff.dto';
import { StaffService, type StaffSummary } from './staff.service';

/** `/admin/staff` — the "Staff & roles" page in the operations console. */
@ApiTags('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  // The `me` routes are declared before `:id` so `me` is never parsed as an id. Any signed-in staff
  // member can use them on their own account, whatever their role.
  @Get('me')
  me(@CurrentStaff() staff: StaffTokenPayload): Promise<StaffSummary> {
    return this.staff.getById(staff.sub);
  }

  @Patch('me')
  updateMe(@CurrentStaff() staff: StaffTokenPayload, @Body() body: UpdateOwnProfileDto): Promise<StaffSummary> {
    return this.staff.update(staff.sub, body);
  }

  @Post('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changeMyPassword(@CurrentStaff() staff: StaffTokenPayload, @Body() body: ChangeOwnPasswordDto): Promise<void> {
    return this.staff.changePassword(staff.sub, body);
  }

  @Put('me/avatar')
  setMyAvatar(@CurrentStaff() staff: StaffTokenPayload, @Body() body: UploadAvatarDto): Promise<StaffSummary> {
    return this.staff.setAvatar(staff.sub, body);
  }

  @Delete('me/avatar')
  removeMyAvatar(@CurrentStaff() staff: StaffTokenPayload): Promise<StaffSummary> {
    return this.staff.removeAvatar(staff.sub);
  }

  @Roles('platform_administrator')
  @Post()
  create(@Body() body: CreateStaffDto): Promise<StaffSummary> {
    return this.staff.create(body);
  }

  @Get()
  list(@Query() query: ListStaffQueryDto) {
    return this.staff.list(query);
  }

  /** Any signed-in staff member can see a colleague's photo (e.g. in the staff list). */
  @Get(':id/avatar')
  async getAvatar(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    const avatar = await this.staff.getAvatar(id);
    return new StreamableFile(avatar.image, { type: avatar.contentType, length: avatar.image.length });
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<StaffSummary> {
    return this.staff.getById(id);
  }

  @Roles('platform_administrator')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateStaffDto): Promise<StaffSummary> {
    return this.staff.update(id, body);
  }
}
