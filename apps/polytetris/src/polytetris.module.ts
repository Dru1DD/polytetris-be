import * as Joi from 'joi';
import { Redis } from 'ioredis';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';
import { HealthModule } from '@libs/health';
import { LoggerMiddleware } from '@libs/logging/middlewares';
import { ApplicationMode } from '@libs/modes/enums';
import { EventsModule } from '@libs/events';
import { IdempotencyModule } from '@libs/idempotency';
import { LockModule } from '@libs/lock';
import { RedisLockModule, RedisLockService } from '@libs/redis-lock';
import { ConsumersModule } from '@libs/consumers';
import { TransactionsModule } from '@libs/transactions';
import { MongodbTransactionsManager, MongodbTransactionsModule } from '@libs/mongodb-transactions';

import { AuthModule } from '@apps/polytetris/auth';
// import { UsersModule } from '@apps/polytetris/users';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000).description('Application port'),
        DATABASE_CONNECTION_URL: Joi.string().required().description('Database connection string'),
        APPLICATION_ORIGIN: Joi.string().required().description('Application origin'),
        COOKIE_DOMAIN: Joi.string().optional().description('Cookie domain'),
        SESSIONS_SECRET: Joi.string().required().description('Session secret'),
        REDIS_URL: Joi.string().required().description('Redis connection string'),
        APPLICATION_MODE: Joi.string().optional().default(ApplicationMode.Default).description('Application mode'),
        KEEPALIVE_TIMEOUT: Joi.number().optional().default(72000).description('Timeout for keep-alive requests'),
        HEADERS_TIMEOUT: Joi.number().optional().default(60000).description('Timeout for headers requests'),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      connectionName: '',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DATABASE_CONNECTION_URL'),
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    LockModule.forRoot({
      imports: [RedisLockModule],
      useExistingLockService: RedisLockService,
    }),
    TransactionsModule.forRoot({
      imports: [MongodbTransactionsModule],
      useExistingTransactionsManager: MongodbTransactionsManager,
    }),

    IdempotencyModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redis: Redis) => ({ redis }),
      inject: [getRedisConnectionToken()],
    }),

    EventsModule,
    AuthModule,
    ConsumersModule,
  ],
})
export class PolytetrisModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).exclude('/health').forRoutes('*');
  }
}
