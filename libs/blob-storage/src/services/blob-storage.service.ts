export interface UploadBlobParams {
  key: string;
  data: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface UploadBlobResult {
  key: string;
  url: string;
}

export interface DownloadBlobParams {
  key: string;
}

export interface DownloadBlobResult {
  data: Buffer;
}

export interface BlobMetadataParams {
  key: string;
}

export interface BlobMetadata {
  url: string;
  etag?: string;
}

export interface GetPublicUrlParams {
  key: string;
}

export interface BlobStorageService {
  /**
   * Upload a blob to storage
   */
  upload(params: UploadBlobParams): Promise<UploadBlobResult>;

  /**
   * Download a blob from storage
   */
  download(params: DownloadBlobParams): Promise<DownloadBlobResult>;

  /**
   * Get metadata for a blob
   */
  getMetadata(params: BlobMetadataParams): Promise<BlobMetadata | null>;

  /**
   * Get public URL for a blob
   */
  getPublicUrl(params: GetPublicUrlParams): Promise<string>;
}
