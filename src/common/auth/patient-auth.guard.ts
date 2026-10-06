import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppConfigService } from '../config/configuration';

/** The decoded patient session token attached to `request.patientAccount` by `PatientAuthGuard`. */
export interface PatientAccountToken {
  /** The `user_accounts.id` the patient signed in as. */
  sub: string;
  email: string;
}

/**
 * Guards patient-facing routes. Verifies a `Bearer` token minted by `IdentityService`
 * (`SESSION_JWT_SECRET`) and attaches it as `request.patientAccount`.
 *
 * Self-contained on purpose: it always passes `SESSION_JWT_SECRET` explicitly, so it works from any
 * module no matter which `JwtService` (patient or the global, staff-secret one) Nest hands it - and a
 * staff token can never be accepted here, nor a patient token on a staff route.
 */
@Injectable()
export class PatientAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      patientAccount?: PatientAccountToken;
    }>();

    const header = request.headers.authorization;
    const value = Array.isArray(header) ? header[0] : header;
    const bearer = value?.startsWith('Bearer ') ? value.slice('Bearer '.length) : undefined;
    if (!bearer) throw new UnauthorizedException('Sign in required.');

    try {
      const payload = await this.jwt.verifyAsync<PatientAccountToken & { role?: string }>(bearer, {
        secret: this.config.sessionJwtSecret,
      });
      // Staff tokens carry a `role`; patient tokens never do. Belt and braces on top of the
      // separate secrets.
      if (payload.role !== undefined) throw new Error('not a patient token');
      request.patientAccount = { sub: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Your session has expired. Sign in again.');
    }
  }
}
