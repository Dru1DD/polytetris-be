import { Inject } from '@nestjs/common';
import TelegramModuleTokens from '@libs/telegram/telegram.module.tokens';

const InjectTelegramApi = () => {
  return Inject(TelegramModuleTokens.Api.TelegramApi);
};

export default InjectTelegramApi;
