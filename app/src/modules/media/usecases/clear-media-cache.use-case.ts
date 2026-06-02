import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MediaItemResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class ClearMediaCacheUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<MediaItemResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({
      where: { id },
      include: { files: { where: { isCached: true } } },
    });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    for (const file of item.files) {
      if (file.localCachePath) {
        const dir = path.dirname(file.localCachePath);
        await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
      }
      await this.prisma.mediaFile.update({
        where: { id: file.id },
        data: { isCached: false, localCachePath: null },
      });
    }

    const updatedItem = await this.prisma.mediaItem.update({
      where: { id },
      data: { status: 'Uploaded' },
      include: MEDIA_ITEM_INCLUDE,
    });

    return mapMediaItem(updatedItem);
  }
}
