import { MediaItemResponseDto } from '../dtos';

type RawMediaItem = {
  id: string;
  originalName: string;
  mimeType: string;
  mediaType: string;
  sizeBytes: bigint;
  checksum: string | null;
  status: string;
  activeProvider: string | null;
  createdAt: Date;
  updatedAt: Date;
  fileType?: { id: string; name: string; openStrategy: string } | null;
  collectionLabels?: Array<{
    collectionLabel: {
      id: string;
      collectionId: string;
      value: string;
      collection: { name: string };
    };
  }>;
};

export function mapMediaItem(item: RawMediaItem): MediaItemResponseDto {
  return {
    id: item.id,
    originalName: item.originalName,
    mimeType: item.mimeType,
    mediaType: item.mediaType,
    sizeBytes: Number(item.sizeBytes),
    checksum: item.checksum,
    status: item.status,
    activeProvider: item.activeProvider,
    fileType: item.fileType
      ? { id: item.fileType.id, name: item.fileType.name, openStrategy: item.fileType.openStrategy }
      : null,
    collectionLabels: (item.collectionLabels ?? []).map((mcl) => ({
      id: mcl.collectionLabel.id,
      collectionId: mcl.collectionLabel.collectionId,
      collectionName: mcl.collectionLabel.collection.name,
      value: mcl.collectionLabel.value,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export const MEDIA_ITEM_INCLUDE = {
  fileType: true,
  collectionLabels: { include: { collectionLabel: { include: { collection: true } } } },
} as const;
