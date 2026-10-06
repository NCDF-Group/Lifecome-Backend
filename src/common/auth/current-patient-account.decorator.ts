import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { PatientAccountToken } from './patient-auth.guard';

/** The signed-in patient's account - only valid behind `PatientAuthGuard`. */
export const CurrentPatientAccount = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PatientAccountToken => {
    const request = ctx.switchToHttp().getRequest<{ patientAccount: PatientAccountToken }>();
    return request.patientAccount;
  },
);
