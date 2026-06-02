import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

export interface UpdateMediaInput {
  originalName?: string;
}

@Injectable()
export class UpdateMediaMetadataUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, input: UpdateMediaInput): Promise<MediaItemResponseDto> {
    const existing = await this.prisma.mediaItem.findUnique({ where: { id } });
    if (!existing || existing.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    const item = await this.prisma.mediaItem.update({
      where: { id },
      data: { originalName: input.originalName ?? existing.originalName },
      include: MEDIA_ITEM_INCLUDE,
    });

    return mapMediaItem(item);
  }
}
