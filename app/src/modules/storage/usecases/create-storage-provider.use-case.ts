import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { StorageProviderResponseDto } from '../dtos';

export interface CreateStorageProviderInput {
  name: string;
  type: string;
  settings: Record<string, unknown>;
}

@Injectable()
export class CreateStorageProviderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsCache: SettingsCacheService,
  ) {}

  async execute(input: CreateStorageProviderInput): Promise<StorageProviderResponseDto> {
    const row = await this.prisma.storageProviderSetting.create({
      data: {
        name: input.name,
        type: input.type,
        settingsJson: JSON.stringify(input.settings),
        isActive: false,
      },
    });

    const activeId = this.settingsCache.get('storage').activeProviderId;

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      isActive: row.id === activeId,
      settings: input.settings,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
