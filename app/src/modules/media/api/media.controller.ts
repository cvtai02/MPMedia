import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Readable } from 'stream';
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
import {
  ListMediaQueryDto,
  PaginatedMediaResponseDto,
  UpdateMediaRequestDto,
  MediaDetailResponseDto,
  MediaItemResponseDto,
} from '../dtos';

@Controller('media')
export class MediaController {
  constructor(
    private readonly uploadMedia: UploadMediaUseCase,
    private readonly listMedia: ListMediaUseCase,
    private readonly getMediaDetail: GetMediaDetailUseCase,
    private readonly downloadMedia: DownloadMediaUseCase,
    private readonly deleteMedia: DeleteMediaUseCase,
    private readonly updateMediaMetadata: UpdateMediaMetadataUseCase,
    private readonly cacheMediaLocally: CacheMediaLocallyUseCase,
    private readonly clearMediaCache: ClearMediaCacheUseCase,
    private readonly assignCollectionLabel: AssignCollectionLabelToMediaUseCase,
    private readonly removeCollectionLabel: RemoveCollectionLabelFromMediaUseCase,
  ) {}

  @Get()
  list(@Query() query: ListMediaQueryDto): Promise<PaginatedMediaResponseDto> {
    return this.listMedia.execute(query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File): Promise<MediaDetailResponseDto> {
    return this.uploadMedia.execute(file);
  }

  @Get(':id')
  detail(@Param('id') id: string): Promise<MediaDetailResponseDto> {
    return this.getMediaDetail.execute(id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, mimeType, filename } = await this.downloadMedia.execute(id);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });
    return new StreamableFile(stream as unknown as Readable);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaRequestDto,
  ): Promise<MediaItemResponseDto> {
    return this.updateMediaMetadata.execute(id, { originalName: dto.originalName });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.deleteMedia.execute(id);
  }

  @Post(':id/cache')
  cacheLocally(@Param('id') id: string): Promise<MediaDetailResponseDto> {
    return this.cacheMediaLocally.execute(id);
  }

  @Delete(':id/cache')
  @HttpCode(HttpStatus.OK)
  clearCache(@Param('id') id: string): Promise<MediaItemResponseDto> {
    return this.clearMediaCache.execute(id);
  }

  @Post(':id/collection-labels/:collectionLabelId')
  addCollectionLabel(
    @Param('id') id: string,
    @Param('collectionLabelId') collectionLabelId: string,
  ): Promise<MediaItemResponseDto> {
    return this.assignCollectionLabel.execute(id, collectionLabelId);
  }

  @Delete(':id/collection-labels/:collectionLabelId')
  @HttpCode(HttpStatus.OK)
  dropCollectionLabel(
    @Param('id') id: string,
    @Param('collectionLabelId') collectionLabelId: string,
  ): Promise<MediaItemResponseDto> {
    return this.removeCollectionLabel.execute(id, collectionLabelId);
  }
}
