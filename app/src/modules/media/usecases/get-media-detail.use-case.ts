import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaDetailResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class GetMediaDetailUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<MediaDetailResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({
      where: { id },
      include: { files: true, ...MEDIA_ITEM_INCLUDE },
    });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    return {
      ...mapMediaItem(item),
      files: item.files.map((f) => ({
        id: f.id,
        providerType: f.providerType,
        providerKey: f.providerKey,
        storagePath: f.storagePath,
        publicUrl: f.publicUrl,
        isPrimary: f.isPrimary,
        isCached: f.isCached,
        localCachePath: f.localCachePath,
      })),
    };
  }
}
