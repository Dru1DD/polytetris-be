import { Bot } from 'grammy';
import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { NestProviderValueFactory } from '@libs/types';

export interface TelegramConfig {
  webhookSecretToken?: string;
  botToken: string;
}

export interface RootAsyncTelegramHostModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useConfigFactory: NestProviderValueFactory<TelegramConfig | Promise<TelegramConfig>>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

const TELEGRAM_CONFIG = Symbol('TELEGRAM_CONFIG');
const BOT_TOKEN = Symbol('BotToken');

@Global()
@Module({})
export class TelegramHostModule {
  public static readonly BOT_TOKEN = BOT_TOKEN;
  public static readonly TELEGRAM_CONFIG = TELEGRAM_CONFIG;

  public static forRootAsync(options: RootAsyncTelegramHostModuleOptions): DynamicModule {
    return {
      module: TelegramHostModule,
      imports: options.imports,
      providers: [
        {
          provide: BOT_TOKEN,
          useFactory: (telegramConfig: TelegramConfig) => {
            return new Bot(telegramConfig.botToken);
          },
          inject: [TELEGRAM_CONFIG],
        },
        {
          provide: TELEGRAM_CONFIG,
          useFactory: options.useConfigFactory,
          inject: options.inject,
        },
      ],
      exports: [BOT_TOKEN, TELEGRAM_CONFIG],
    };
  }
}
