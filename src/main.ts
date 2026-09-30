import 'reflect-metadata';

import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AppConfigService } from './common/config/configuration';
import { startSelfPing } from './common/keep-alive/self-ping';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ trustProxy: true }), {
    bufferLogs: true,
  });

  const config = app.get(AppConfigService);
  app.useLogger(app.get(Logger));

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyHelmet, { global: true });
  await fastify.register(fastifyCompress);
  await fastify.register(fastifyCors, { origin: config.corsOrigins, credentials: true });
  await fastify.register(fastifyRateLimit, { max: 100, timeWindow: '1 minute' });

  // Echoes the correlation id (see app.module.ts's pinoHttp.genReqId) back to the caller.
  fastify.addHook('onSend', (request, reply, payload, done) => {
    reply.header('x-correlation-id', request.id);
    done(null, payload);
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  // Served in every environment (including production) so the frontend teams consuming this API
  // — the LifeCome Live web app and mobile app — have one live reference for request/response
  // shapes, rather than a doc that only exists locally.
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('LifeCome Live API')
      .setDescription('Modular-monolith API for the LifeCome Live platform. See ../docs/prd for the product blueprint.')
      .setVersion('0.1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  await app.listen(config.port, '0.0.0.0');

  const pinoLogger = app.get(PinoLogger);
  pinoLogger.setContext('SelfPing');
  startSelfPing(pinoLogger);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
