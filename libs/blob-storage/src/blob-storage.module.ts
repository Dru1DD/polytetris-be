import { DynamicModule, Module } from '@nestjs/common';
import { BlobStorageHostModule, RegisterImplementHostBlobStorageModuleOptions } from './host';
import { getBlobStorageServiceToken } from './utils';

export type RegisterImplementBlobStorageModuleOptions = RegisterImplementHostBlobStorageModuleOptions;

@Module({})
export class BlobStorageModule {
  public static register(bucketName?: string): DynamicModule {
    return {
      module: BlobStorageModule,
      providers: [
        {
          provide: getBlobStorageServiceToken(bucketName),
          useExisting: BlobStorageHostModule.getHostBlobStorageServiceToken(bucketName),
        },
      ],
      exports: [getBlobStorageServiceToken(bucketName)],
    };
  }

  public static registerImplementation(options: RegisterImplementBlobStorageModuleOptions): DynamicModule {
    return {
      module: BlobStorageModule,
      imports: [BlobStorageHostModule.registerImplementation(options)],
    };
  }
}
