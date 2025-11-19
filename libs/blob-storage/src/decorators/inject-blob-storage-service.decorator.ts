import { Inject } from '@nestjs/common';
import { getBlobStorageServiceToken } from '@libs/blob-storage/utils';

const InjectBlobStorageService = (bucketId?: string) => {
  return Inject(getBlobStorageServiceToken(bucketId));
};

export default InjectBlobStorageService;
