import { SetMetadata } from '@nestjs/common';

import type { StaffRole } from './staff-token';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given staff roles. No `@Roles()` at all means "any signed-in staff member". */
export const Roles = (...roles: StaffRole[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);

export const ALLOW_CLINICIAN_KEY = 'allowClinician';

/**
 * Lets a `clinician` use a route that has no `@Roles()` (i.e. "any signed-in staff"). Clinicians are
 * default-deny: every other un-annotated admin route would otherwise hand them patients, payments
 * and the audit log. Only self-service routes (`/admin/staff/me*`) opt in.
 */
export const AllowClinician = (): ReturnType<typeof SetMetadata> => SetMetadata(ALLOW_CLINICIAN_KEY, true);
