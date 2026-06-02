import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { StorageProviderResponseDto } from '../dtos';

export interface UpdateStorageProviderInput {
  name?: string;
  settings?: Record<string, unknown>;
}

@Injectable()
export class UpdateStorageProviderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
  ) {}

  async execute(id: string, input: UpdateStorageProviderInput): Promise<StorageProviderResponseDto> {
    const existing = await this.prisma.storageProviderSetting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('StorageProvider', id);

    const mergedSettings = input.settings
      ? { ...(JSON.parse(existing.settingsJson) as Record<string, unknown>), ...input.settings }
      : JSON.parse(existing.settingsJson) as Record<string, unknown>;

    const row = await this.prisma.storageProviderSetting.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        settingsJson: JSON.stringify(mergedSettings),
      },
    });

    const activeId = this.settingsCache.get('storage').activeProviderId;

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      isActive: row.id === activeId,
      settings: mergedSettings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
