const BLOB_STORAGE_SERVICE_TOKEN_NAME = '__BLOB_STORAGE_SERVICE';

export const getBlobStorageServiceToken = (bucketId?: string): string => {
  return bucketId ? `${BLOB_STORAGE_SERVICE_TOKEN_NAME}_${bucketId.toUpperCase()}` : BLOB_STORAGE_SERVICE_TOKEN_NAME;
};
