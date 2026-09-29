import { SetMetadata } from '@nestjs/common';

import type { StaffRole } from './staff-token';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given staff roles. No `@Roles()` at all means "any signed-in staff member". */
export const Roles = (...roles: StaffRole[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
