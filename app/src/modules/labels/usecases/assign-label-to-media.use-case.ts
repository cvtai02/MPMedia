import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../../media/dtos';

@Injectable()
export class AssignLabelToMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(mediaId: string, labelId: string): Promise<MediaItemResponseDto> {
    const [item, label] = await Promise.all([
      this.prisma.mediaItem.findUnique({ where: { id: mediaId } }),
      this.prisma.label.findUnique({ where: { id: labelId } }),
    ]);
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', mediaId);
    if (!label) throw new NotFoundException('Label', labelId);

    await this.prisma.mediaLabel.upsert({
      where: { mediaItemId_labelId: { mediaItemId: mediaId, labelId } },
      create: { mediaItemId: mediaId, labelId },
      update: {},
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
