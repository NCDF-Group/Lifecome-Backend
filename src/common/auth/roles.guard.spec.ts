/* eslint-disable @typescript-eslint/unbound-method -- the guard reads decorator metadata off the method itself */
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { AllowClinician, Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import type { StaffRole } from './staff-token';

class Plain {
  open(): void {}

  @AllowClinician()
  selfService(): void {}

  @Roles('clinician')
  clinicianOnly(): void {}

  @Roles('platform_administrator')
  adminOnly(): void {}
}

function contextFor(handler: () => void, role: StaffRole): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => Plain,
    switchToHttp: () => ({ getRequest: () => ({ staff: { sub: 'x', email: 'x@y.z', role } }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = Plain.prototype;

  it('lets any non-clinician staff role use an un-annotated route', () => {
    expect(guard.canActivate(contextFor(proto.open, 'support_agent'))).toBe(true);
  });

  it('denies a clinician on an un-annotated route (default-deny)', () => {
    expect(() => guard.canActivate(contextFor(proto.open, 'clinician'))).toThrow(ForbiddenException);
  });

  it('lets a clinician use a route that opts in with @AllowClinician()', () => {
    expect(guard.canActivate(contextFor(proto.selfService, 'clinician'))).toBe(true);
  });

  it('lets a clinician use a route that names the clinician role', () => {
    expect(guard.canActivate(contextFor(proto.clinicianOnly, 'clinician'))).toBe(true);
  });

  it('keeps clinicians out of admin-only routes and admins out of clinician-only routes', () => {
    expect(() => guard.canActivate(contextFor(proto.adminOnly, 'clinician'))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextFor(proto.clinicianOnly, 'platform_administrator'))).toThrow(ForbiddenException);
  });
});
