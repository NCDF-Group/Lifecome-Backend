import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';
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

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ staff: StaffTokenPayload }>();
    if (!requiredRoles.includes(request.staff.role)) {
      throw new ForbiddenException('Your role does not have access to this.');
    }
    return true;
  }
}
