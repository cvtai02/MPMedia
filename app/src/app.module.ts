import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { AuthModule } from './modules/auth/api/auth.module';
import { AdminsModule } from './modules/admins/api/admins.module';
import { SettingsModule } from './modules/settings/api/settings.module';
import { StorageModule } from './modules/storage/api/storage.module';
import { MediaModule } from './modules/media/api/media.module';
import { LabelsModule } from './modules/labels/api/labels.module';
import { FileTypesModule } from './modules/file-types/api/file-types.module';
import { CollectionsModule } from './modules/collections/api/collections.module';

@Module({
  imports: [PrismaModule, AuthModule, AdminsModule, SettingsModule, StorageModule, MediaModule, LabelsModule, FileTypesModule, CollectionsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
