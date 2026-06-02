import { BaseApiClient } from '../shared/base.client';
import { MediaItem, ListMediaQuery, UpdateMediaRequest } from './media.types';
import { PaginatedResponse } from '../shared/types';

export class MediaClient extends BaseApiClient {
  list(query?: ListMediaQuery): Promise<PaginatedResponse<MediaItem>> {
    const params = new URLSearchParams(query as Record<string, string>);
    return this.get<PaginatedResponse<MediaItem>>(`/media?${params}`);
  }

  getById(id: string): Promise<MediaItem> {
    return this.get<MediaItem>(`/media/${id}`);
  }

  upload(file: File, onProgress?: (pct: number) => void): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<MediaItem>('/media/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  update(id: string, body: UpdateMediaRequest): Promise<MediaItem> {
    return this.patch<MediaItem>(`/media/${id}`, body);
  }

  remove(id: string): Promise<void> {
    return this.delete<void>(`/media/${id}`);
  }

  cache(id: string): Promise<MediaItem> {
    return this.post<MediaItem>(`/media/${id}/cache`);
  }

  clearCache(id: string): Promise<void> {
    return this.delete<void>(`/media/${id}/cache`);
  }
}
