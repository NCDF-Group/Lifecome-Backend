import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { nanoid } from 'nanoid';
import { LoggerModule } from 'nestjs-pino';

import { CommonAuthModule } from './common/auth/common-auth.module';
import { ConfigModule } from './common/config/config.module';
import { AppConfigService } from './common/config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { ZodValidationPipe } from './common/validation/zod-validation.pipe';
import { DrizzleModule } from './db/client';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './queue/redis.module';

import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorisationModule } from './modules/authorisation/authorisation.module';
import { BookingModule } from './modules/booking/booking.module';
import { CareCoordinationModule } from './modules/care-coordination/care-coordination.module';
import { ClinicalRecordsModule } from './modules/clinical-records/clinical-records.module';
import { ConsentModule } from './modules/consent/consent.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { HealthModule } from './modules/health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PatientModule } from './modules/patient/patient.module';
import { PayerModule } from './modules/payer/payer.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProviderDirectoryModule } from './modules/provider-directory/provider-directory.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { ServiceCatalogueModule } from './modules/service-catalogue/service-catalogue.module';
import { StaffModule } from './modules/staff/staff.module';

@Module({
  imports: [
    // --- Cross-cutting infrastructure ---
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logLevel,
          // Reuses an inbound correlation id if the caller sent one, otherwise mints one — the
          // same id is then echoed back by CorrelationIdMiddleware (blueprint §7.1).
          genReqId: (req: { headers: Record<string, string | string[] | undefined> }) => {
            const header = req.headers['x-correlation-id'];
            return (Array.isArray(header) ? header[0] : header) ?? nanoid();
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.code', // OTP code
              'req.body.password',
            ],
            censor: '[redacted]',
          },
          transport: config.isProduction ? undefined : { target: 'pino-pretty', options: { singleLine: true } },
        },
      }),
    }),
    DrizzleModule,
    RedisModule,
    QueueModule,
    CommonAuthModule,

    // --- Domain modules (blueprint §7) ---
    AuditModule,
    IdentityModule,
    PatientModule,
    PayerModule,
    EligibilityModule,
    AuthorisationModule,
    ServiceCatalogueModule,
    ProviderDirectoryModule,
    SchedulingModule,
    BookingModule,
    PaymentModule,
    ConsultationModule,
    ClinicalRecordsModule,
    CareCoordinationModule,
    MessagingModule,
    NotificationsModule,
    DocumentsModule,
    ConsentModule,

    // --- Operations console (blueprint §2.3 — Lifecome-admin) ---
    StaffModule,
    AuthModule,
    AdminDashboardModule,

    HealthModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
})
export class AppModule {}
