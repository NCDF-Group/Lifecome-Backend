import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PatientLoginDto, RegisterDto, RequestOtpDto, SetPasswordDto, VerifyOtpDto } from './dto/register.dto';
import { IdentityService, type PatientSession, type UserAccountSummary } from './identity.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  /** View 01 — Sign In / Create Account. Also sends the first OTP, by email. */
  @Post('register')
  register(@Body() body: RegisterDto): Promise<UserAccountSummary> {
    return this.identity.register(body.email, body.phoneNumber);
  }

  @Post('otp/request')
  requestOtp(@Body() body: RequestOtpDto): Promise<{ expiresAt: Date }> {
    return this.identity.requestOtp(body.userAccountId);
  }

  /** View 02 — Verify Email. */
  @Post('otp/verify')
  verifyOtp(@Body() body: VerifyOtpDto): Promise<UserAccountSummary> {
    return this.identity.verifyOtp(body.userAccountId, body.code);
  }

  /** View 03 — Create Password. Signs the patient in immediately after. */
  @Post('password')
  setPassword(@Body() body: SetPasswordDto): Promise<PatientSession> {
    return this.identity.setPassword(body.userAccountId, body.password);
  }

  /** Welcome back — email+password sign-in. */
  @Post('login')
  login(@Body() body: PatientLoginDto): Promise<PatientSession> {
    return this.identity.login(body.email, body.password);
  }
}
