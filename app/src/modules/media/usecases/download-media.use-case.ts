import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { StorageProviderFactory, StorageProviderType } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { NotFoundException } from '../../../shared/errors/app-exceptions';

export interface DownloadResult {
  stream: NodeJS.ReadableStream;
  mimeType: string;
  filename: string;
}

@Injectable()
export class DownloadMediaUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: StorageProviderFactory,
  ) {}

  async execute(id: string): Promise<DownloadResult> {
    const item = await this.prisma.mediaItem.findUnique({
      where: { id },
      include: { files: { where: { isPrimary: true } } },
    });
    if (!item || item.status === 'Deleted') throw new NotFoundException('MediaItem', id);

    const primaryFile = item.files[0];
    if (!primaryFile) throw new NotFoundException('MediaFile for', id);

    // Serve from local cache when available
    if (primaryFile.isCached && primaryFile.localCachePath) {
      const fs = await import('fs');
      return {
        stream: fs.createReadStream(primaryFile.localCachePath),
        mimeType: item.mimeType,
        filename: item.originalName,
      };
    }

    if (!item.activeProvider) throw new NotFoundException('StorageProvider for MediaItem', id);
    const providerRow = await this.prisma.storageProviderSetting.findUnique({
      where: { id: item.activeProvider },
    });
    if (!providerRow) throw new NotFoundException('StorageProvider', item.activeProvider);

    const provider = this.factory.create(primaryFile.providerType as StorageProviderType, providerRow.settingsJson);
    const stream = await provider.download({ key: primaryFile.providerKey });

    return { stream, mimeType: item.mimeType, filename: item.originalName };
  }
}
