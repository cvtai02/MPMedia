export type StorageProviderType = 'R2' | 'GoogleDrive' | 'LocalDisk';

export interface StorageProvider {
  id: string;
  name: string;
  type: StorageProviderType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorageProviderRequest {
  name: string;
  type: StorageProviderType;
  settings: Record<string, unknown>;
}

export interface UpdateStorageProviderRequest {
  name?: string;
  settings?: Record<string, unknown>;
}
