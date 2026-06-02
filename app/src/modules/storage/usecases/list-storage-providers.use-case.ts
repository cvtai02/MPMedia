import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { StorageProviderResponseDto } from '../dtos';

@Injectable()
export class ListStorageProvidersUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
  ) {}

  async execute(): Promise<StorageProviderResponseDto[]> {
    const activeId = this.settingsCache.get('storage').activeProviderId;
    const rows = await this.prisma.storageProviderSetting.findMany({ orderBy: { createdAt: 'asc' } });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      isActive: row.id === activeId,
      settings: JSON.parse(row.settingsJson) as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}
