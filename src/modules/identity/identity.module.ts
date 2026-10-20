import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '../../common/config/configuration';
import { EmailModule } from '../../common/email/email.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PatientJwtAuthGuard } from './patient-jwt-auth.guard';

@Module({
  imports: [
    EmailModule,
    // Module-scoped, so JwtService resolves to this SESSION_JWT_SECRET-signed instance here
    // (and in PatientJwtAuthGuard) rather than CommonAuthModule's global, staff-secret one.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.sessionJwtSecret,
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [IdentityController],
  providers: [IdentityService, PatientJwtAuthGuard],
  exports: [IdentityService, PatientJwtAuthGuard],
})
export class IdentityModule {}
