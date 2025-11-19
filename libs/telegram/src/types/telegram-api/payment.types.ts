import {
  type PreCheckoutQuery as ExternalPreCheckoutQuery,
  type SuccessfulPayment as ExternalSuccessfulPayment,
} from 'grammy/types';

export interface LabeledPrice {
  label: string;
  amount: number;
}

export type PreCheckoutQuery = ExternalPreCheckoutQuery;
export type SuccessfulPayment = ExternalSuccessfulPayment;
