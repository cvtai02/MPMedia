import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsCacheService } from '../../../infrastructure/settings/settings-cache.service';
import { GetSettingsUseCase } from '../usecases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../usecases/update-settings.use-case';
import { ReloadSettingsUseCase } from '../usecases/reload-settings.use-case';

@Module({
  controllers: [SettingsController],
  providers: [SettingsCacheService, GetSettingsUseCase, UpdateSettingsUseCase, ReloadSettingsUseCase],
  exports: [SettingsCacheService],
})
export class SettingsModule {}
