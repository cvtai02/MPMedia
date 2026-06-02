import { BaseApiClient } from '../shared/base.client';
import { StorageProvider, CreateStorageProviderRequest, UpdateStorageProviderRequest } from './storage-providers.types';

export class StorageProvidersClient extends BaseApiClient {
  list(): Promise<StorageProvider[]> { return this.get<StorageProvider[]>('/storage-providers'); }
  create(body: CreateStorageProviderRequest): Promise<StorageProvider> { return this.post<StorageProvider>('/storage-providers', body); }
  update(id: string, body: UpdateStorageProviderRequest): Promise<StorageProvider> { return this.patch<StorageProvider>(`/storage-providers/${id}`, body); }
  activate(id: string): Promise<StorageProvider> { return this.post<StorageProvider>(`/storage-providers/${id}/activate`); }
  test(id: string): Promise<{ healthy: boolean; message?: string }> { return this.post(`/storage-providers/${id}/test`); }
  remove(id: string): Promise<void> { return this.delete<void>(`/storage-providers/${id}`); }
}
