import { DynamicModule, Global, Module } from '@nestjs/common';
import { getBlobStorageServiceToken } from '@libs/blob-storage/utils';
import { getHostBlobStorageServiceToken } from './utils';

export interface BlobStorageImplementationModule extends DynamicModule {
  bucketId: string;
}

export interface RegisterImplementHostBlobStorageModuleOptions {
  implementationModule: BlobStorageImplementationModule;
}

@Global()
@Module({})
export class BlobStorageHostModule {
  static getHostBlobStorageServiceToken = getHostBlobStorageServiceToken;

  public static registerImplementation(options: RegisterImplementHostBlobStorageModuleOptions): DynamicModule {
    return {
      module: BlobStorageHostModule,
      imports: [options.implementationModule],
      providers: [
        {
          provide: getHostBlobStorageServiceToken(options.implementationModule.bucketId),
          useExisting: getBlobStorageServiceToken(options.implementationModule.bucketId),
        },
      ],
      exports: [getHostBlobStorageServiceToken(options.implementationModule.bucketId)],
    };
  }
}
