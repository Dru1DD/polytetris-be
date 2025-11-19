import { Inject } from '@nestjs/common';
import TelegramModuleTokens from '@libs/telegram/telegram.module.tokens';

const InjectTelegramWebhookMiddlewareFactory = () => {
  return Inject(TelegramModuleTokens.Factories.TelegramWebhookMiddlewareFactory);
};

export default InjectTelegramWebhookMiddlewareFactory;
