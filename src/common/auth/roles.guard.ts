import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ALLOW_CLINICIAN_KEY, ROLES_KEY } from './roles.decorator';
import type { StaffRole, StaffTokenPayload } from './staff-token';

/** Must run after `JwtAuthGuard` — reads `request.staff` it attaches. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{ staff: StaffTokenPayload }>();

    if (!requiredRoles || requiredRoles.length === 0) {
      // "Any signed-in staff" - except clinicians, who must be named explicitly (or the route opts in
      // with `@AllowClinician()`), so a doctor's login can never reach the admin data by default.
      if (request.staff.role === 'clinician') {
        const allowed = this.reflector.getAllAndOverride<boolean | undefined>(ALLOW_CLINICIAN_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (!allowed) throw new ForbiddenException('Your role does not have access to this.');
      }
      return true;
    }

    if (!requiredRoles.includes(request.staff.role)) {
      throw new ForbiddenException('Your role does not have access to this.');
    }
    return true;
  }
}
