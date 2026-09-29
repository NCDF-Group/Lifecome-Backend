"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _nanoid = require("nanoid");
const _nestjspino = require("nestjs-pino");
const _commonauthmodule = require("./common/auth/common-auth.module");
const _configmodule = require("./common/config/config.module");
const _configuration = require("./common/config/configuration");
const _httpexceptionfilter = require("./common/filters/http-exception.filter");
const _idempotencyinterceptor = require("./common/interceptors/idempotency.interceptor");
const _zodvalidationpipe = require("./common/validation/zod-validation.pipe");
const _client = require("./db/client");
const _queuemodule = require("./queue/queue.module");
const _redismodule = require("./queue/redis.module");
const _admindashboardmodule = require("./modules/admin-dashboard/admin-dashboard.module");
const _auditmodule = require("./modules/audit/audit.module");
const _authmodule = require("./modules/auth/auth.module");
const _authorisationmodule = require("./modules/authorisation/authorisation.module");
const _bookingmodule = require("./modules/booking/booking.module");
const _carecoordinationmodule = require("./modules/care-coordination/care-coordination.module");
const _clinicalrecordsmodule = require("./modules/clinical-records/clinical-records.module");
const _consentmodule = require("./modules/consent/consent.module");
const _consultationmodule = require("./modules/consultation/consultation.module");
const _documentsmodule = require("./modules/documents/documents.module");
const _eligibilitymodule = require("./modules/eligibility/eligibility.module");
const _healthmodule = require("./modules/health/health.module");
const _identitymodule = require("./modules/identity/identity.module");
const _messagingmodule = require("./modules/messaging/messaging.module");
const _notificationsmodule = require("./modules/notifications/notifications.module");
const _patientmodule = require("./modules/patient/patient.module");
const _payermodule = require("./modules/payer/payer.module");
const _paymentmodule = require("./modules/payment/payment.module");
const _providerdirectorymodule = require("./modules/provider-directory/provider-directory.module");
const _schedulingmodule = require("./modules/scheduling/scheduling.module");
const _servicecataloguemodule = require("./modules/service-catalogue/service-catalogue.module");
const _staffmodule = require("./modules/staff/staff.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
        r = Reflect.decorate(decorators, target, key, desc);
    } else {
        for(var i = decorators.length - 1; i >= 0; i--){
            if (d = decorators[i]) {
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            }
        }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            // --- Cross-cutting infrastructure ---
            _configmodule.ConfigModule,
            _nestjspino.LoggerModule.forRootAsync({
                imports: [
                    _configmodule.ConfigModule
                ],
                inject: [
                    _configuration.AppConfigService
                ],
                useFactory: (config)=>({
                        pinoHttp: {
                            level: config.logLevel,
                            // Reuses an inbound correlation id if the caller sent one, otherwise mints one — the
                            // same id is then echoed back by CorrelationIdMiddleware (blueprint §7.1).
                            genReqId: (req)=>{
                                const header = req.headers['x-correlation-id'];
                                return (Array.isArray(header) ? header[0] : header) ?? (0, _nanoid.nanoid)();
                            },
                            redact: {
                                paths: [
                                    'req.headers.authorization',
                                    'req.headers.cookie',
                                    'req.body.code',
                                    'req.body.password'
                                ],
                                censor: '[redacted]'
                            },
                            transport: config.isProduction ? undefined : {
                                target: 'pino-pretty',
                                options: {
                                    singleLine: true
                                }
                            }
                        }
                    })
            }),
            _client.DrizzleModule,
            _redismodule.RedisModule,
            _queuemodule.QueueModule,
            _commonauthmodule.CommonAuthModule,
            // --- Domain modules (blueprint §7) ---
            _auditmodule.AuditModule,
            _identitymodule.IdentityModule,
            _patientmodule.PatientModule,
            _payermodule.PayerModule,
            _eligibilitymodule.EligibilityModule,
            _authorisationmodule.AuthorisationModule,
            _servicecataloguemodule.ServiceCatalogueModule,
            _providerdirectorymodule.ProviderDirectoryModule,
            _schedulingmodule.SchedulingModule,
            _bookingmodule.BookingModule,
            _paymentmodule.PaymentModule,
            _consultationmodule.ConsultationModule,
            _clinicalrecordsmodule.ClinicalRecordsModule,
            _carecoordinationmodule.CareCoordinationModule,
            _messagingmodule.MessagingModule,
            _notificationsmodule.NotificationsModule,
            _documentsmodule.DocumentsModule,
            _consentmodule.ConsentModule,
            // --- Operations console (blueprint §2.3 — Lifecome-admin) ---
            _staffmodule.StaffModule,
            _authmodule.AuthModule,
            _admindashboardmodule.AdminDashboardModule,
            _healthmodule.HealthModule
        ],
        providers: [
            {
                provide: _core.APP_PIPE,
                useClass: _zodvalidationpipe.ZodValidationPipe
            },
            {
                provide: _core.APP_FILTER,
                useClass: _httpexceptionfilter.HttpExceptionFilter
            },
            {
                provide: _core.APP_INTERCEPTOR,
                useClass: _idempotencyinterceptor.IdempotencyInterceptor
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map