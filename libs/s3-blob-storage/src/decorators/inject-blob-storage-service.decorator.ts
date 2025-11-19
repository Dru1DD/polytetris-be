import { Inject } from '@nestjs/common';
import { getBlobStorageServiceToken } from '@libs/blob-storage/host/utils';

const InjectBlobStorageService = (bucketName?: string) => {
  return Inject(getBlobStorageServiceToken(bucketName));
};

export default InjectBlobStorageService;
