export class MediaCollectionLabelDto {
  id: string;
  collectionId: string;
  collectionName: string;
  value: string;
}

export class MediaFileTypeDto {
  id: string;
  name: string;
  openStrategy: string;
}

export class MediaItemResponseDto {
  id: string;
  originalName: string;
  mimeType: string;
  mediaType: string;
  sizeBytes: number;
  checksum: string | null;
  status: string;
  activeProvider: string | null;
  fileType: MediaFileTypeDto | null;
  collectionLabels: MediaCollectionLabelDto[];
  createdAt: Date;
  updatedAt: Date;
}
