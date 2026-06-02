import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { StorageProviderFactory, StorageProviderType } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { StorageHealthStatus } from '../../../infrastructure/storage-providers/media-storage-provider.interface';
import { NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class TestStorageProviderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly factory: StorageProviderFactory,
  ) {}

  async execute(id: string): Promise<StorageHealthStatus> {
    const row = await this.prisma.storageProviderSetting.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('StorageProvider', id);

    const provider = this.factory.create(row.type as StorageProviderType, row.settingsJson);
    return provider.healthCheck();
  }
}
