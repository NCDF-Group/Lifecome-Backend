import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { StaffTokenPayload } from './staff-token';

/** The staff member `JwtAuthGuard` attached to the request — only valid behind that guard. */
export const CurrentStaff = createParamDecorator((_data: unknown, ctx: ExecutionContext): StaffTokenPayload => {
  const request = ctx.switchToHttp().getRequest<{ staff: StaffTokenPayload }>();
  return request.staff;
});
