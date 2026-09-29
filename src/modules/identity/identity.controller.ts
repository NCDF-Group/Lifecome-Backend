import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RegisterDto, RequestOtpDto, VerifyOtpDto } from './dto/register.dto';
import { IdentityService, type UserAccountSummary } from './identity.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  /** View 01 — Sign In / Create Account. Also sends the first OTP. */
  @Post('register')
  register(@Body() body: RegisterDto): Promise<UserAccountSummary> {
    return this.identity.register(body.phoneNumber);
  }

  @Post('otp/request')
  requestOtp(@Body() body: RequestOtpDto): Promise<{ expiresAt: Date }> {
    return this.identity.requestOtp(body.userAccountId);
  }

  /** View 02 — Verify Mobile Number. */
  @Post('otp/verify')
  verifyOtp(@Body() body: VerifyOtpDto): Promise<UserAccountSummary> {
    return this.identity.verifyOtp(body.userAccountId, body.code);
  }
}
