import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'nestjs-s3';
import { PutObjectCommand, HeadObjectCommand, GetObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import {
  BlobStorageService,
  UploadBlobParams,
  UploadBlobResult,
  DownloadBlobParams,
  DownloadBlobResult,
  BlobMetadataParams,
  BlobMetadata,
  GetPublicUrlParams,
} from '@libs/blob-storage/services';

@Injectable()
export class S3BlobStorageService implements BlobStorageService {
  private readonly logger = new Logger(S3BlobStorageService.name);

  constructor(
    private readonly s3Client: S3,
    private readonly bucketName: string,
  ) {}

  public async getPublicUrl(params: GetPublicUrlParams): Promise<string> {
    return this.generateUrl(params.key);
  }

  public async upload(params: UploadBlobParams): Promise<UploadBlobResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      Body: params.data,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });

    await this.s3Client.send(command);

    this.logger.log(`Successfully uploaded blob: ${params.key}`);

    return {
      key: params.key,
      url: this.generateUrl(params.key),
    };
  }

  public async download(params: DownloadBlobParams): Promise<DownloadBlobResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
    });

    const result = await this.s3Client.send(command);

    if (!result.Body) {
      throw new Error(`Blob not found: ${params.key}`);
    }

    // Convert the AWS S3 response body to Buffer
    const data = Buffer.from(await result.Body.transformToByteArray());

    return { data };
  }

  public async getMetadata(params: BlobMetadataParams): Promise<BlobMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: params.key,
      });

      const result = await this.s3Client.send(command);

      return {
        url: this.generateUrl(params.key),
        etag: result.ETag,
      };
    } catch (error: unknown) {
      if (this.isNotFound(error)) {
        return null;
      }

      throw error;
    }
  }

  private isNotFound(error: unknown) {
    return error instanceof S3ServiceException && error.$metadata?.httpStatusCode === 404;
  }

  private generateUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
