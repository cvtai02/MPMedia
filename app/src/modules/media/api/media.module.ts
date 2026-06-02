import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { StorageModule } from '../../storage/api/storage.module';
import { UploadMediaUseCase } from '../usecases/upload-media.use-case';
import { ListMediaUseCase } from '../usecases/list-media.use-case';
import { GetMediaDetailUseCase } from '../usecases/get-media-detail.use-case';
import { DownloadMediaUseCase } from '../usecases/download-media.use-case';
import { DeleteMediaUseCase } from '../usecases/delete-media.use-case';
import { UpdateMediaMetadataUseCase } from '../usecases/update-media-metadata.use-case';
import { CacheMediaLocallyUseCase } from '../usecases/cache-media-locally.use-case';
import { ClearMediaCacheUseCase } from '../usecases/clear-media-cache.use-case';
import { AssignCollectionLabelToMediaUseCase } from '../usecases/assign-collection-label-to-media.use-case';
import { RemoveCollectionLabelFromMediaUseCase } from '../usecases/remove-collection-label-from-media.use-case';

@Module({
  imports: [StorageModule],
  controllers: [MediaController],
  providers: [
    UploadMediaUseCase,
    ListMediaUseCase,
    GetMediaDetailUseCase,
    DownloadMediaUseCase,
    DeleteMediaUseCase,
    UpdateMediaMetadataUseCase,
    CacheMediaLocallyUseCase,
    ClearMediaCacheUseCase,
    AssignCollectionLabelToMediaUseCase,
    RemoveCollectionLabelFromMediaUseCase,
  ],
})
export class MediaModule {}
