"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppConfigService", {
    enumerable: true,
    get: function() {
        return AppConfigService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
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
function _ts_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") {
        return Reflect.metadata(metadataKey, metadataValue);
    }
}
let AppConfigService = class AppConfigService {
    get isProduction() {
        return this.config.get('NODE_ENV', {
            infer: true
        }) === 'production';
    }
    get port() {
        return this.config.get('PORT', {
            infer: true
        });
    }
    get corsOrigins() {
        return this.config.get('CORS_ORIGIN', {
            infer: true
        });
    }
    get logLevel() {
        return this.config.get('LOG_LEVEL', {
            infer: true
        });
    }
    get databaseUrl() {
        return this.config.get('DATABASE_URL', {
            infer: true
        });
    }
    get redisUrl() {
        return this.config.get('REDIS_URL', {
            infer: true
        });
    }
    get sessionJwtSecret() {
        return this.config.get('SESSION_JWT_SECRET', {
            infer: true
        });
    }
    get staffJwtSecret() {
        return this.config.get('STAFF_JWT_SECRET', {
            infer: true
        });
    }
    get allowSelfConfirmBookings() {
        return this.config.get('ALLOW_SELF_CONFIRM_BOOKINGS', {
            infer: true
        });
    }
    get paymentWebhookSecret() {
        return this.config.get('PAYMENT_WEBHOOK_SECRET', {
            infer: true
        });
    }
    get paystackSecretKey() {
        return this.config.get('PAYSTACK_SECRET_KEY', {
            infer: true
        });
    }
    get httpsmsApiKey() {
        return this.config.get('HTTPSMS_API_KEY', {
            infer: true
        });
    }
    get httpsmsFromNumber() {
        return this.config.get('HTTPSMS_FROM_NUMBER', {
            infer: true
        });
    }
    get brevoApiKey() {
        return this.config.get('BREVO_API_KEY', {
            infer: true
        });
    }
    get brevoSenderEmail() {
        return this.config.get('BREVO_SENDER_EMAIL', {
            infer: true
        });
    }
    get brevoSenderName() {
        return this.config.get('BREVO_SENDER_NAME', {
            infer: true
        });
    }
    constructor(config){
        this.config = config;
    }
};
AppConfigService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AppConfigService);

//# sourceMappingURL=configuration.js.map