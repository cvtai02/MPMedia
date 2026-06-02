import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageProviderFactory } from '../../../infrastructure/storage-providers/storage-provider.factory';
import { SettingsModule } from '../../settings/api/settings.module';
import { ListStorageProvidersUseCase } from '../usecases/list-storage-providers.use-case';
import { CreateStorageProviderUseCase } from '../usecases/create-storage-provider.use-case';
import { UpdateStorageProviderUseCase } from '../usecases/update-storage-provider.use-case';
import { SetActiveStorageProviderUseCase } from '../usecases/set-active-storage-provider.use-case';
import { TestStorageProviderUseCase } from '../usecases/test-storage-provider.use-case';

@Module({
  imports: [SettingsModule],
  controllers: [StorageController],
  providers: [
    StorageProviderFactory,
    ListStorageProvidersUseCase,
    CreateStorageProviderUseCase,
    UpdateStorageProviderUseCase,
    SetActiveStorageProviderUseCase,
    TestStorageProviderUseCase,
  ],
  exports: [StorageProviderFactory, SettingsModule],
})
export class StorageModule {}
