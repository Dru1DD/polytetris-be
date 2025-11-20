import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from '@apps/polytetris/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000).description('Application port'),
        APPLICATION_ORIGIN: Joi.string().required().description('Application origin'),
        COOKIE_DOMAIN: Joi.string().optional().description('Cookie domain'),
        SESSIONS_SECRET: Joi.string().required().description('Session secret'),
        REDIS_URL: Joi.string().required().description('Redis connection string'),
        KEEPALIVE_TIMEOUT: Joi.number().optional().default(72000).description('Timeout for keep-alive requests'),
        HEADERS_TIMEOUT: Joi.number().optional().default(60000).description('Timeout for headers requests'),
      }),
    }),
    ScheduleModule.forRoot(),
    // MongooseModule.forRootAsync({
    //   connectionName: '',
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get('DATABASE_CONNECTION_URL'),
    //   }),
    // }),
    // RedisModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'single',
    //     url: configService.getOrThrow('REDIS_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),

    AuthModule,
  ],
})
export class PolytetrisModule {}
