"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpExceptionFilter", {
    enumerable: true,
    get: function() {
        return HttpExceptionFilter;
    }
});
const _common = require("@nestjs/common");
const _nestjspino = require("nestjs-pino");
const _appexception = require("../errors/app-exception");
const _zodvalidationexception = require("../validation/zod-validation.exception");
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
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const correlationId = request.id;
        const { status, body } = this.resolve(exception, correlationId);
        if (status >= 500) {
            this.logger.error({
                err: exception,
                correlationId
            }, 'Unhandled exception');
        } else {
            this.logger.warn({
                correlationId,
                code: body.error.code
            }, 'Request failed');
        }
        void response.status(status).send(body);
    }
    resolve(exception, correlationId) {
        if (exception instanceof _zodvalidationexception.ZodValidationException) {
            return {
                status: _common.HttpStatus.BAD_REQUEST,
                body: {
                    error: {
                        code: _appexception.CommonErrorCodes.VALIDATION_FAILED,
                        message: 'Some fields are missing or invalid.',
                        details: exception.getZodError().issues.map((issue)=>({
                                path: issue.path.join('.'),
                                message: issue.message
                            }))
                    },
                    correlationId
                }
            };
        }
        if (exception instanceof _appexception.AppException) {
            return {
                status: exception.getStatus(),
                body: {
                    error: {
                        code: exception.code,
                        message: exception.message
                    },
                    correlationId
                }
            };
        }
        if (exception instanceof _common.HttpException) {
            const status = exception.getStatus();
            const payload = exception.getResponse();
            const message = typeof payload === 'string' ? payload : payload.message ?? exception.message;
            return {
                status,
                body: {
                    error: {
                        code: _common.HttpStatus[status] ?? 'HTTP_ERROR',
                        message
                    },
                    correlationId
                }
            };
        }
        return {
            status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Something went wrong on our side. Please try again.'
                },
                correlationId
            }
        };
    }
    constructor(logger){
        this.logger = logger;
        this.logger.setContext(HttpExceptionFilter.name);
    }
};
HttpExceptionFilter = _ts_decorate([
    (0, _common.Catch)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _nestjspino.PinoLogger === "undefined" ? Object : _nestjspino.PinoLogger
    ])
], HttpExceptionFilter);

//# sourceMappingURL=http-exception.filter.js.map