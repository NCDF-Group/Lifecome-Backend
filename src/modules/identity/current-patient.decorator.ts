import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { PatientTokenPayload } from './patient-token';

/** The patient `PatientJwtAuthGuard` attached to the request — only valid behind that guard. */
export const CurrentPatient = createParamDecorator((_data: unknown, ctx: ExecutionContext): PatientTokenPayload => {
  const request = ctx.switchToHttp().getRequest<{ patient: PatientTokenPayload }>();
  return request.patient;
});
