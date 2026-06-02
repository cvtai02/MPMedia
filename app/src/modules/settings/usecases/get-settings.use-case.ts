import { Injectable } from '@nestjs/common';
import { AppSettings, SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';

@Injectable()
export class GetSettingsUseCase {
  constructor(private readonly cache: SettingsCacheService) {}

  execute(): AppSettings {
    return this.cache.getAll();
  }
}
