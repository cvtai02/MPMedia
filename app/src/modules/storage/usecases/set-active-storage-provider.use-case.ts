import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { StorageProviderResponseDto } from '../dtos';

@Injectable()
export class SetActiveStorageProviderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
  ) {}

  async execute(id: string): Promise<StorageProviderResponseDto> {
    const provider = await this.prisma.storageProviderSetting.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('StorageProvider', id);

    await this.settingsCache.update({ storage: { activeProviderId: id } });

    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      isActive: true,
      settings: JSON.parse(provider.settingsJson) as Record<string, unknown>,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}
