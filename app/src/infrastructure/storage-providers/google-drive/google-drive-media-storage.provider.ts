import {
  MediaStorageProvider,
  StorageHealthStatus,
  UploadMediaObjectInput,
  UploadedMediaObject,
  DownloadMediaObjectInput,
  DeleteMediaObjectInput,
  CheckMediaObjectInput,
} from '../media-storage-provider.interface';

export interface GoogleDriveSettings {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId?: string;
}

export class GoogleDriveMediaStorageProvider implements MediaStorageProvider {
  constructor(private readonly settings: GoogleDriveSettings) {}

  async upload(_input: UploadMediaObjectInput): Promise<UploadedMediaObject> {
    throw new Error('Google Drive provider not yet implemented');
  }

  async download(_input: DownloadMediaObjectInput): Promise<NodeJS.ReadableStream> {
    throw new Error('Google Drive provider not yet implemented');
  }

  async delete(_input: DeleteMediaObjectInput): Promise<void> {
    throw new Error('Google Drive provider not yet implemented');
  }

  async exists(_input: CheckMediaObjectInput): Promise<boolean> {
    throw new Error('Google Drive provider not yet implemented');
  }

  async healthCheck(): Promise<StorageHealthStatus> {
    return { healthy: false, message: 'Google Drive provider not yet implemented' };
  }
}
