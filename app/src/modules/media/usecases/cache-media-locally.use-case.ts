import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { StorageProviderFactory, StorageProviderType } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { sanitizeFilename } from '../../../shared/utils/media-type.util';
import { MediaDetailResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class CacheMediaLocallyUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
    private readonly factory: StorageProviderFactory,
  ) {}

  async execute(id: string): Promise<MediaDetailResponseDto> {
    const item = await this.prisma.mediaItem.findUnique({
      where: { id },
      include: { files: true, ...MEDIA_ITEM_INCLUDE },
    });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    const primaryFile = item.files.find((f) => f.isPrimary);
    if (!primaryFile) throw new NotFoundException('Primary MediaFile for', id);

    if (primaryFile.isCached && primaryFile.localCachePath) {
      const exists = await fs.promises.access(primaryFile.localCachePath).then(() => true).catch(() => false);
      if (exists) return this.toDto(item, item.files);
    }

    const cachePath = this.settingsCache.get('cache').path;
    const localPath = path.join(cachePath, item.id, primaryFile.id, sanitizeFilename(item.originalName));
    await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

    if (!item.activeProvider) throw new NotFoundException('StorageProvider for MediaItem', id);
    const providerRow = await this.prisma.storageProviderSetting.findUnique({ where: { id: item.activeProvider } });
    if (!providerRow) throw new NotFoundException('StorageProvider', item.activeProvider);

    const provider = this.factory.create(primaryFile.providerType as StorageProviderType, providerRow.settingsJson);
    const stream = await provider.download({ key: primaryFile.providerKey });
    await pipeline(stream as unknown as Readable, fs.createWriteStream(localPath));

    const updatedFile = await this.prisma.mediaFile.update({
      where: { id: primaryFile.id },
      data: { isCached: true, localCachePath: localPath },
    });

    const updatedItem = await this.prisma.mediaItem.update({
      where: { id },
      data: { status: 'Cached' },
      include: MEDIA_ITEM_INCLUDE,
    });

    const allFiles = item.files.map((f) => (f.id === updatedFile.id ? updatedFile : f));
    return this.toDto(updatedItem, allFiles);
  }

  private toDto(item: any, files: any[]): MediaDetailResponseDto {
    return {
      ...mapMediaItem(item),
      files: files.map((f) => ({
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
