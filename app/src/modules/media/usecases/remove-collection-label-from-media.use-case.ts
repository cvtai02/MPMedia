import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class RemoveCollectionLabelFromMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(mediaId: string, collectionLabelId: string): Promise<MediaItemResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({ where: { id: mediaId } });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', mediaId);

    await this.prisma.mediaItemCollectionLabel.deleteMany({
      where: { mediaItemId: mediaId, collectionLabelId },
    });

    const updated = await this.prisma.mediaItem.findUnique({ where: { id: mediaId }, include: MEDIA_ITEM_INCLUDE });
    return mapMediaItem(updated!);
  }
}
