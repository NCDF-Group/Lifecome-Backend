import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppException } from '../../common/errors/app-exception';
import { StaffService, type StaffSummary } from '../staff/staff.service';
import type { StaffLoginDto } from './dto/auth.dto';

const TOKEN_TTL_SECONDS = 60 * 60 * 12; // matches CommonAuthModule's JwtModule signOptions.expiresIn

export interface StaffSession {
  accessToken: string;
  expiresIn: number;
  staff: StaffSummary;
}

/**
 * Staff sign-in (`/admin/auth/login`) — separate from `IdentityModule`'s patient phone+OTP flow.
 * `Lifecome-admin`'s `/login` page posts here once wired up (see that app's README, "Known gap:
 * admin auth").
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly staff: StaffService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: StaffLoginDto): Promise<StaffSession> {
    const account = await this.staff.verifyCredentials(input.email, input.password);
    if (!account) {
      throw new AppException('INVALID_CREDENTIALS', 'Email or password is incorrect.', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = await this.jwt.signAsync({ sub: account.id, email: account.email, role: account.role });
    return { accessToken, expiresIn: TOKEN_TTL_SECONDS, staff: account };
  }
}
