import { getS3ConnectionToken, S3Module, S3 } from 'nestjs-s3';
import { InjectionToken, Module, ModuleMetadata } from '@nestjs/common';
import { NestProviderValueFactory } from '@libs/types';
import { BlobStorageImplementationModule, getBlobStorageServiceToken } from '@libs/blob-storage';
import { S3BlobStorageService } from './services';

export interface S3BlobStorageHostModuleOptions {
  bucketId: string;
  s3ConnectionName?: string;
  s3bucketName: string;
}

export type S3BucketConfiguration = Omit<S3BlobStorageHostModuleOptions, 'bucketId' | 's3ConnectionName'>;

export interface S3BlobStorageHostModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  bucketId: string;
  s3ConnectionName?: string;
  useBucketConfigurationFactory: NestProviderValueFactory<S3BucketConfiguration | Promise<S3BucketConfiguration>>;
  inject?: Array<InjectionToken>;
}

@Module({})
export class S3BlobStorageModule {
  public static register(options: S3BlobStorageHostModuleOptions): BlobStorageImplementationModule {
    const serviceProvider = {
      provide: getBlobStorageServiceToken(options.bucketId),
      useFactory: async (s3Client: S3) => {
        return new S3BlobStorageService(s3Client, options.s3bucketName);
      },
      inject: [getS3ConnectionToken(options.s3ConnectionName)],
    };

    return {
      module: S3BlobStorageModule,
      imports: [S3Module],
      providers: [serviceProvider],
      exports: [getBlobStorageServiceToken(options.bucketId)],
      bucketId: options.bucketId,
    };
  }

  public static registerAsync(options: S3BlobStorageHostModuleAsyncOptions): BlobStorageImplementationModule {
    const CONFIG_TOKEN = `S3_BUCKET_CONFIGURATION_${options.bucketId}`;

    const configProvider = {
      provide: CONFIG_TOKEN,
      useFactory: options.useBucketConfigurationFactory,
      inject: options.inject,
    };

    const serviceProvider = {
      provide: getBlobStorageServiceToken(options.bucketId),
      useFactory: async (s3Client: S3, bucketConfiguration: S3BucketConfiguration) => {
        return new S3BlobStorageService(s3Client, bucketConfiguration.s3bucketName);
      },
      inject: [getS3ConnectionToken(options.s3ConnectionName), CONFIG_TOKEN],
    };

    return {
      module: S3BlobStorageModule,
      imports: [S3Module, ...options.imports],
      providers: [configProvider, serviceProvider],
      exports: [getBlobStorageServiceToken(options.bucketId)],
      bucketId: options.bucketId,
    };
  }
}
