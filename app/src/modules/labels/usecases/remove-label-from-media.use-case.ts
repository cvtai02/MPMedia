import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../../media/dtos';

@Injectable()
export class RemoveLabelFromMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(mediaId: string, labelId: string): Promise<MediaItemResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({ where: { id: mediaId } });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', mediaId);

    await this.prisma.mediaLabel.deleteMany({
      where: { mediaItemId: mediaId, labelId },
    });

    const updated = await this.prisma.mediaItem.findUniqueOrThrow({
      where: { id: mediaId },
      include: { labels: { include: { label: true } } },
    });

    return {
      id: updated.id,
      originalName: updated.originalName,
      mimeType: updated.mimeType,
      mediaType: updated.mediaType,
      sizeBytes: Number(updated.sizeBytes),
      checksum: updated.checksum,
      status: updated.status,
      activeProvider: updated.activeProvider,
      fileType: null,
      collectionLabels: [],
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
