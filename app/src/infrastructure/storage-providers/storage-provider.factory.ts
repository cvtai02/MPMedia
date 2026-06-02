import { Injectable } from '@nestjs/common';
import { MediaStorageProvider } from './media-storage-provider.interface';
import { LocalDiskMediaStorageProvider, LocalDiskSettings } from './local-disk/local-disk-media-storage.provider';
import { R2MediaStorageProvider, R2Settings } from './r2/r2-media-storage.provider';
import { GoogleDriveMediaStorageProvider, GoogleDriveSettings } from './google-drive/google-drive-media-storage.provider';

export type StorageProviderType = 'LocalDisk' | 'R2' | 'GoogleDrive';

@Injectable()
export class StorageProviderFactory {
  create(type: StorageProviderType, settingsJson: string): MediaStorageProvider {
    const settings = JSON.parse(settingsJson) as Record<string, unknown>;

    switch (type) {
      case 'LocalDisk':
        return new LocalDiskMediaStorageProvider(
          ((settings as unknown) as LocalDiskSettings).basePath ?? '.local-storage',
        );

      case 'R2':
        return new R2MediaStorageProvider((settings as unknown) as R2Settings);

      case 'GoogleDrive':
        return new GoogleDriveMediaStorageProvider((settings as unknown) as GoogleDriveSettings);

      default:
        throw new Error(`Unknown storage provider type: ${String(type)}`);
    }
  }
}
