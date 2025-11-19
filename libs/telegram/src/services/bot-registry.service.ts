import { Bot } from 'grammy';
import { DiscoveredClass, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnUpdateMetadata } from '@libs/telegram/types';
import { TELEGRAM_BOT_CONTROLLER_METADATA_KEY, ON_UPDATE_METADATA_KEY } from '@libs/telegram/constants';

@Injectable()
export class DefaultBotRegistryService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private bot: Bot,
  ) {}

  public async onModuleInit() {
    const discoveredClassesWithMeta = await this.discoveryService.providersWithMetaAtKey(
      TELEGRAM_BOT_CONTROLLER_METADATA_KEY,
    );

    for (const discoveredClassWithMeta of discoveredClassesWithMeta) {
      const { discoveredClass } = discoveredClassWithMeta;

      this.registerOnHandlers(discoveredClass);
    }
  }

  private registerOnHandlers(discoveredClass: DiscoveredClass) {
    const discoveredMethodsWithMeta = this.discoveryService.classMethodsWithMetaAtKey<OnUpdateMetadata>(
      discoveredClass,
      ON_UPDATE_METADATA_KEY,
    );

    for (const discoveredMethodWithMeta of discoveredMethodsWithMeta) {
      const {
        discoveredMethod,
        meta: { trigger },
      } = discoveredMethodWithMeta;

      this.bot.on(
        trigger,
        (context) => {
          return discoveredMethod.handler.bind(discoveredMethod.parentClass.instance)(context.update);
        },
        discoveredMethod.handler.bind(discoveredMethod.parentClass.instance),
      );
    }
  }
}
