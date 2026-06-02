import { Injectable } from '@nestjs/common';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';

@Injectable()
export class ReloadSettingsUseCase {
  constructor(private readonly cache: SettingsCacheService) {}

  async execute(): Promise<void> {
    await this.cache.reload();
  }
}
