import type { staffRoleEnum } from '../../db/schema';

export type StaffRole = (typeof staffRoleEnum.enumValues)[number];

/** The decoded JWT payload attached to `request.staff` by `JwtAuthGuard`. */
export interface StaffTokenPayload {
  sub: string;
  email: string;
  role: StaffRole;
}
