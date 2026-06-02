import { Injectable } from '@nestjs/common';
import { AppSettings, SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { UpdateSettingsRequestDto } from '../dtos';

@Injectable()
export class UpdateSettingsUseCase {
  constructor(private readonly cache: SettingsCacheService) {}

  async execute(dto: UpdateSettingsRequestDto): Promise<AppSettings> {
    return this.cache.update(dto);
  }
}
