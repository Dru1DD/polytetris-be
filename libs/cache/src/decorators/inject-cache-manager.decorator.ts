import { Inject } from '@nestjs/common';
import { getCacheManagerToken } from '@libs/cache/utils';

const InjectCacheManager = (cacheNamespace: string) => {
  return Inject(getCacheManagerToken(cacheNamespace));
};

export default InjectCacheManager;
