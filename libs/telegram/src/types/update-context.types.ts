import { type TelegramUpdate } from './telegram-api';

export interface UpdateContext {
  update: TelegramUpdate;
}

export interface MessageUpdateContext extends UpdateContext {
  updateType: 'message';
  message: TelegramUpdate['message'];
}

export interface ChannelPostUpdateContext extends UpdateContext {
  updateType: 'channel_post';
  channelPost: TelegramUpdate['channel_post'];
}

export interface PreCheckoutQueryUpdateContext extends UpdateContext {
  updateType: 'pre_checkout_query';
  preCheckoutQuery: TelegramUpdate['pre_checkout_query'];
}
