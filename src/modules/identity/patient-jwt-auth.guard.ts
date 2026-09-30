import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { PatientTokenPayload } from './patient-token';

/**
 * Verifies a `Bearer` JWT minted by `IdentityService.login`/`setPassword` and attaches its
 * payload to `request.patient`. The `JwtService` injected here resolves to the one
 * `IdentityModule` registers with `SESSION_JWT_SECRET` (module-scoped providers take precedence
 * over `CommonAuthModule`'s global, `STAFF_JWT_SECRET`-signed one for anything declared inside
 * `IdentityModule`), so this can never accept a staff token.
 */
@Injectable()
export class PatientJwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      patient?: PatientTokenPayload;
    }>();

    const header = request.headers.authorization;
    const token = Array.isArray(header) ? header[0] : header;
    const bearer = token?.startsWith('Bearer ') ? token.slice('Bearer '.length) : undefined;

    if (!bearer) {
      throw new UnauthorizedException('Sign in required.');
    }

    try {
      request.patient = await this.jwt.verifyAsync<PatientTokenPayload>(bearer);
      return true;
    } catch {
      throw new UnauthorizedException('Your session has expired. Sign in again.');
    }
  }
}
