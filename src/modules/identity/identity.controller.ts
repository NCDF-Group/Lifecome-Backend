import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ConfirmPasswordResetDto,
  PatientLoginDto,
  RegisterDto,
  RequestOtpDto,
  RequestPasswordResetDto,
  VerifyOtpDto,
  VerifyPasswordResetCodeDto,
} from './dto/register.dto';
import { IdentityService, type PatientSession, type UserAccountSummary } from './identity.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  /** View 01 — Create Account. Collects name, email, mobile number and password in one step,
   * then sends the first OTP by SMS to that number. */
  @Post('register')
  register(@Body() body: RegisterDto): Promise<UserAccountSummary> {
    return this.identity.register(body.firstName, body.lastName, body.email, body.phoneNumber, body.password);
  }

  @Post('otp/request')
  requestOtp(@Body() body: RequestOtpDto): Promise<{ expiresAt: Date }> {
    return this.identity.requestOtp(body.userAccountId);
  }

  /** View 02 — Verify Mobile. The password was already set at registration, so a successful
   * verify signs the patient straight in. */
  @Post('otp/verify')
  verifyOtp(@Body() body: VerifyOtpDto): Promise<PatientSession> {
    return this.identity.verifyOtp(body.userAccountId, body.code);
  }

  /** Welcome back — email+password sign-in. */
  @Post('login')
  login(@Body() body: PatientLoginDto): Promise<PatientSession> {
    return this.identity.login(body.email, body.password);
  }

  /** Forgot password, step 1 — always responds the same whether or not the email has an account. */
  @Post('password-reset/request')
  requestPasswordReset(@Body() body: RequestPasswordResetDto): Promise<{ expiresAt: Date }> {
    return this.identity.requestPasswordReset(body.email);
  }

  /** Forgot password, step 2 — checks the code without consuming it (see `confirmPasswordReset`). */
  @Post('password-reset/verify')
  verifyPasswordResetCode(@Body() body: VerifyPasswordResetCodeDto): Promise<void> {
    return this.identity.verifyPasswordResetCode(body.email, body.code);
  }

  /** Forgot password, step 3 — consumes the code and sets the new password. */
  @Post('password-reset/confirm')
  confirmPasswordReset(@Body() body: ConfirmPasswordResetDto): Promise<void> {
    return this.identity.confirmPasswordReset(body.email, body.code, body.newPassword);
  }
}
