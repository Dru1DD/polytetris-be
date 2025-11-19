import { SetMetadata } from '@nestjs/common';
import { TELEGRAM_BOT_CONTROLLER_METADATA_KEY } from '@libs/telegram/constants';

const TelegramBotController = () => {
  return SetMetadata(TELEGRAM_BOT_CONTROLLER_METADATA_KEY, true);
};

export default TelegramBotController;
