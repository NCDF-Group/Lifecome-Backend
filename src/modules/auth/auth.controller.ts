import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService, type StaffSession } from './auth.service';
import { StaffLoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: StaffLoginDto): Promise<StaffSession> {
    return this.auth.login(body);
  }
}
