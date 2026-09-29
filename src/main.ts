import 'reflect-metadata';

import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AppConfigService } from './common/config/configuration';

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

  if (!config.isProduction) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('LifeCome Live API')
        .setDescription('Modular-monolith API for the LifeCome Live platform. See ../docs/prd for the product blueprint.')
        .setVersion('0.1.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(config.port, '0.0.0.0');
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
