import {
  MediaStorageProvider,
  StorageHealthStatus,
  UploadMediaObjectInput,
  UploadedMediaObject,
  DownloadMediaObjectInput,
  DeleteMediaObjectInput,
  CheckMediaObjectInput,
  GetSignedDownloadUrlInput,
} from '../media-storage-provider.interface';

export interface R2Settings {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl?: string;
}

export class R2MediaStorageProvider implements MediaStorageProvider {
  constructor(private readonly settings: R2Settings) {}

  async upload(_input: UploadMediaObjectInput): Promise<UploadedMediaObject> {
    throw new Error('R2 provider not yet implemented');
  }

  async download(_input: DownloadMediaObjectInput): Promise<NodeJS.ReadableStream> {
    throw new Error('R2 provider not yet implemented');
  }

  async delete(_input: DeleteMediaObjectInput): Promise<void> {
    throw new Error('R2 provider not yet implemented');
  }

  async exists(_input: CheckMediaObjectInput): Promise<boolean> {
    throw new Error('R2 provider not yet implemented');
  }

  async getSignedDownloadUrl(_input: GetSignedDownloadUrlInput): Promise<string> {
    throw new Error('R2 provider not yet implemented');
  }

  async healthCheck(): Promise<StorageHealthStatus> {
    return { healthy: false, message: 'R2 provider not yet implemented' };
  }
}
