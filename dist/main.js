"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _compress = /*#__PURE__*/ _interop_require_default(require("@fastify/compress"));
const _cors = /*#__PURE__*/ _interop_require_default(require("@fastify/cors"));
const _helmet = /*#__PURE__*/ _interop_require_default(require("@fastify/helmet"));
const _ratelimit = /*#__PURE__*/ _interop_require_default(require("@fastify/rate-limit"));
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _platformfastify = require("@nestjs/platform-fastify");
const _swagger = require("@nestjs/swagger");
const _nestjspino = require("nestjs-pino");
const _appmodule = require("./app.module");
const _configuration = require("./common/config/configuration");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, new _platformfastify.FastifyAdapter({
        trustProxy: true
    }), {
        bufferLogs: true
    });
    const config = app.get(_configuration.AppConfigService);
    app.useLogger(app.get(_nestjspino.Logger));
    const fastify = app.getHttpAdapter().getInstance();
    await fastify.register(_helmet.default, {
        global: true
    });
    await fastify.register(_compress.default);
    await fastify.register(_cors.default, {
        origin: config.corsOrigins,
        credentials: true
    });
    await fastify.register(_ratelimit.default, {
        max: 100,
        timeWindow: '1 minute'
    });
    // Echoes the correlation id (see app.module.ts's pinoHttp.genReqId) back to the caller.
    fastify.addHook('onSend', (request, reply, payload, done)=>{
        reply.header('x-correlation-id', request.id);
        done(null, payload);
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: _common.VersioningType.URI,
        defaultVersion: '1'
    });
    app.enableShutdownHooks();
    if (!config.isProduction) {
        const document = _swagger.SwaggerModule.createDocument(app, new _swagger.DocumentBuilder().setTitle('LifeCome Live API').setDescription('Modular-monolith API for the LifeCome Live platform. See ../docs/prd for the product blueprint.').setVersion('0.1.0').build());
        _swagger.SwaggerModule.setup('docs', app, document);
    }
    await app.listen(config.port, '0.0.0.0');
}
bootstrap().catch((error)=>{
    console.error('Failed to start:', error);
    process.exit(1);
});

//# sourceMappingURL=main.js.map