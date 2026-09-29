import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { StaffTokenPayload } from './staff-token';

/**
 * Verifies a `Bearer` JWT minted by `AuthService.login` and attaches its payload to
 * `request.staff`. This app has no session/cookie auth for staff — every admin-console request
 * carries this header (see the console's `lib/api/client.ts`, once wired up).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      staff?: StaffTokenPayload;
    }>();

    const header = request.headers.authorization;
    const token = Array.isArray(header) ? header[0] : header;
    const bearer = token?.startsWith('Bearer ') ? token.slice('Bearer '.length) : undefined;

    if (!bearer) {
      throw new UnauthorizedException('Sign in required.');
    }

    try {
      request.staff = await this.jwt.verifyAsync<StaffTokenPayload>(bearer);
      return true;
    } catch {
      throw new UnauthorizedException('Your session has expired. Sign in again.');
    }
  }
}
