import { MediaItemResponseDto } from './media-item.response.dto';

export class MediaFileDto {
  id: string;
  providerType: string;
  providerKey: string;
  storagePath: string;
  publicUrl: string | null;
  isPrimary: boolean;
  isCached: boolean;
  localCachePath: string | null;
}

export class MediaDetailResponseDto extends MediaItemResponseDto {
  files: MediaFileDto[];
}
