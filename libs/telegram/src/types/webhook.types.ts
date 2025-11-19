import { webhookCallback } from 'grammy';

export type TelegramWebhookMiddlewareFactory = (provider: 'express' | 'fastify') => ReturnType<typeof webhookCallback>;
