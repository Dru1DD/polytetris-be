import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import secureSession from '@fastify/secure-session';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';

import * as dayjs from 'dayjs';
import * as utcPlugin from 'dayjs/plugin/utc';
import { PolytetrisModule } from './polytetris.module';
import { ValidationPipe } from '@nestjs/common';

dayjs.extend(utcPlugin);

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(PolytetrisModule, new FastifyAdapter());

  const configService: ConfigService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.register(fastifyCookie);

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

  app.register(cors, {
    origin: ['http://localhost:3010', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.listen(configService.getOrThrow<string>('PORT'), '0.0.0.0');
}

bootstrap();
