export type StorageProviderType = 'R2' | 'GoogleDrive' | 'LocalDisk';

export interface StorageProviderEntity {
  id: string;
  name: string;
  type: StorageProviderType;
  isActive: boolean;
  settingsJson: string;
  createdAt: Date;
  updatedAt: Date;
}
