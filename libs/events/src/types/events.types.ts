import { AnyObject } from '@libs/types';

export interface Event<Type extends string, Data extends AnyObject> {
  id: string;
  type: Type;
  category: string;
  data: Data;
  createdAt: Date;
  meta?: AnyObject;
}
