export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
export type MediaStatus = 'Uploaded' | 'Cached' | 'BackedUp' | 'Failed' | 'Deleted';

export interface MediaEntity {
  id: string;
  originalName: string;
  mimeType: string;
  mediaType: MediaType;
  sizeBytes: bigint;
  checksum: string | null;
  status: MediaStatus;
  activeProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
}
