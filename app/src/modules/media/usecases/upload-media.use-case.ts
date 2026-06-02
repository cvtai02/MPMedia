import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { StorageProviderFactory, StorageProviderType } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { StorageNotConfiguredError } from '../../../shared/errors/storage-not-configured.error';
import { inferMediaType, sanitizeFilename } from '../../../shared/utils/media-type.util';
import { MediaDetailResponseDto } from '../dtos';

@Injectable()
export class UploadMediaUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
    private readonly factory: StorageProviderFactory,
  ) {}

  async execute(file: Express.Multer.File): Promise<MediaDetailResponseDto> {
    const { activeProviderId } = this.settingsCache.get('storage');
    if (!activeProviderId) throw new StorageNotConfiguredError();

    const providerRow = await this.prisma.storageProviderSetting.findUnique({
      where: { id: activeProviderId },
    });
    if (!providerRow) throw new StorageNotConfiguredError();

    const provider = this.factory.create(providerRow.type as StorageProviderType, providerRow.settingsJson);

    const mediaItem = await this.prisma.mediaItem.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        mediaType: inferMediaType(file.mimetype),
        sizeBytes: BigInt(file.size),
        checksum: createHash('sha256').update(file.buffer).digest('hex'),
        status: 'Uploaded',
        activeProvider: activeProviderId,
      },
    });

    const storageKey = `media/${mediaItem.id}/${sanitizeFilename(file.originalname)}`;
    const uploaded = await provider.upload({
      key: storageKey,
      buffer: file.buffer,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        mediaItemId: mediaItem.id,
        providerType: providerRow.type,
        providerKey: uploaded.providerKey,
        storagePath: uploaded.storagePath,
        publicUrl: uploaded.publicUrl,
        isPrimary: true,
        isCached: false,
      },
    });

    return {
      id: mediaItem.id,
      originalName: mediaItem.originalName,
      mimeType: mediaItem.mimeType,
      mediaType: mediaItem.mediaType,
      sizeBytes: Number(mediaItem.sizeBytes),
      checksum: mediaItem.checksum,
      status: mediaItem.status,
      activeProvider: mediaItem.activeProvider,
      fileType: null,
      collectionLabels: [],
      createdAt: mediaItem.createdAt,
      updatedAt: mediaItem.updatedAt,
      files: [
        {
          id: mediaFile.id,
          providerType: mediaFile.providerType,
          providerKey: mediaFile.providerKey,
          storagePath: mediaFile.storagePath,
          publicUrl: mediaFile.publicUrl,
          isPrimary: mediaFile.isPrimary,
          isCached: mediaFile.isCached,
          localCachePath: mediaFile.localCachePath,
        },
      ],
    };
  }
}
