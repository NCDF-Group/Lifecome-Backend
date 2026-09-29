import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/configuration';
import { CurrentStaff } from './current-staff.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * `@Global` so any module's controller can `@UseGuards(JwtAuthGuard, RolesGuard)` without
 * importing this module directly — the same reasoning as `DrizzleModule` for `DRIZZLE`.
 * Registered once in `app.module.ts`.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.staffJwtSecret,
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class CommonAuthModule {}

export { CurrentStaff, JwtAuthGuard, RolesGuard };
export { Roles } from './roles.decorator';
export type { StaffRole, StaffTokenPayload } from './staff-token';
