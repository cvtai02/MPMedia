import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class AssignCollectionLabelToMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(mediaId: string, collectionLabelId: string): Promise<MediaItemResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({ where: { id: mediaId } });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', mediaId);

    const label = await this.prisma.collectionLabel.findUnique({ where: { id: collectionLabelId } });
    if (!label) throw new NotFoundException('CollectionLabel', collectionLabelId);

    await this.prisma.mediaItemCollectionLabel.upsert({
      where: { mediaItemId_collectionLabelId: { mediaItemId: mediaId, collectionLabelId } },
      create: { mediaItemId: mediaId, collectionLabelId },
      update: {},
    });

    const updated = await this.prisma.mediaItem.findUnique({ where: { id: mediaId }, include: MEDIA_ITEM_INCLUDE });
    return mapMediaItem(updated!);
  }
}
