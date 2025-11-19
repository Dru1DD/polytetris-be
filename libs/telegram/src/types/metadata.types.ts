export type UpdateTrigger =
  | 'message'
  | 'edited_message'
  | 'channel_post'
  | 'edited_channel_post'
  | 'inline_query'
  | 'chosen_inline_result'
  | 'callback_query'
  | 'shipping_query'
  | 'pre_checkout_query'
  | 'message:successful_payment';

export interface OnUpdateMetadata {
  trigger: UpdateTrigger[] | UpdateTrigger;
}
