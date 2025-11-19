const HOST_BLOB_STORAGE_SERVICE_TOKEN_NAME = '__HOST_BLOB_STORAGE_SERVICE';

export const getHostBlobStorageServiceToken = (bucketId?: string): string => {
  return bucketId
    ? `${HOST_BLOB_STORAGE_SERVICE_TOKEN_NAME}_${bucketId.toUpperCase()}`
    : HOST_BLOB_STORAGE_SERVICE_TOKEN_NAME;
};
