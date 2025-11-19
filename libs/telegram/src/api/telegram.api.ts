import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';
import { LabeledPrice } from '@libs/telegram/types';

export interface CreateInvoiceLinkParams {
  title: string;
  description: string;
  payload: string;
  providerToken: string;
  currency: string;
  prices: LabeledPrice[];
  photoUrl?: string;
}

export interface AnswerPreCheckoutQueryParams {
  preCheckoutQueryId: string;
  ok: boolean;
  errorMessage?: string;
}

export interface TelegramApi {
  sendMessage(chatId: string, message: string): Promise<void>;
  createInvoiceLink(params: CreateInvoiceLinkParams): Promise<string>;
  answerPreCheckoutQuery(params: AnswerPreCheckoutQueryParams): Promise<void>;
}

@Injectable()
export class GrammyTelegramApi implements TelegramApi {
  constructor(private bot: Bot) {}

  public async sendMessage(chatId: string, message: string) {
    await this.bot.api.sendMessage(chatId, message);
  }

  public async createInvoiceLink(params: CreateInvoiceLinkParams) {
    return this.bot.api.createInvoiceLink(
      params.title,
      params.description,
      params.payload,
      params.providerToken,
      params.currency,
      params.prices,
      {
        photo_url: params.photoUrl,
      },
    );
  }

  public async answerPreCheckoutQuery(params: AnswerPreCheckoutQueryParams) {
    await this.bot.api.answerPreCheckoutQuery(params.preCheckoutQueryId, params.ok, {
      error_message: params.errorMessage,
    });
  }
}
