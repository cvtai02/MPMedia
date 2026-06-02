export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
export type MediaStatus = 'Uploaded' | 'Cached' | 'BackedUp' | 'Failed' | 'Deleted';

export interface MediaItem {
  id: string;
  originalName: string;
  mimeType: string;
  mediaType: MediaType;
  sizeBytes: number;
  checksum: string | null;
  status: MediaStatus;
  activeProvider: string | null;
  createdAt: string;
  updatedAt: string;
  labels: { id: string; name: string; color: string | null }[];
}

export interface ListMediaQuery {
  page?: number;
  limit?: number;
  labelId?: string;
  mediaType?: MediaType;
  status?: MediaStatus;
}

export interface UpdateMediaRequest {
  originalName?: string;
}
