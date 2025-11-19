import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import fastifyCors from '@fastify/cors';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import { ValidationPipe } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utcPlugin from 'dayjs/plugin/utc';
import { PolytetrisModule } from './polytetris.module';

dayjs.extend(utcPlugin);

const CORS_ACCESS_CONTROL_MAX_AGE = 172800; // 48 hours
const CORS_ALLOWED_HEADERS = [
  'content-type',
  'content-disposition',
  'accept',
  'origin',
  'referer',
  'etag',
  'if-none-match',
];

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(PolytetrisModule, new FastifyAdapter());


  const configService: ConfigService = app.get(ConfigService);

  const server = app.getHttpServer();

  server.keepAliveTimeout = configService.getOrThrow<number>('KEEPALIVE_TIMEOUT');
  server.headersTimeout = configService.getOrThrow<number>('HEADERS_TIMEOUT');

  await app.register(secureSession, {
    key: Buffer.concat([Buffer.from(configService.getOrThrow<string>('SESSIONS_SECRET'), 'hex')], 32),
    cookie: {
      domain: configService.get<string>('COOKIE_DOMAIN'),
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'none',
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const env = configService.get<string | undefined>('NODE_ENV') || 'development';

  if (env === 'production') {
    app.setGlobalPrefix('api');

    const applicationOrigin = configService.getOrThrow<string>('APPLICATION_ORIGIN');

    await app.register(fastifyCors, {
      origin: applicationOrigin.trim().split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: CORS_ALLOWED_HEADERS,
      exposedHeaders: CORS_ALLOWED_HEADERS,
      maxAge: CORS_ACCESS_CONTROL_MAX_AGE,
      credentials: true,
    });
  }

  await app.listen(configService.getOrThrow<string>('PORT'), '0.0.0.0');
}

bootstrap();
