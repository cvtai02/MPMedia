import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateCollectionLabelUseCase } from '../usecases/create-collection-label.use-case';
import { CreateCollectionUseCase } from '../usecases/create-collection.use-case';
import { DeleteCollectionLabelUseCase } from '../usecases/delete-collection-label.use-case';
import { DeleteCollectionUseCase } from '../usecases/delete-collection.use-case';
import { ListCollectionsUseCase } from '../usecases/list-collections.use-case';
import { UpdateCollectionLabelUseCase } from '../usecases/update-collection-label.use-case';
import { UpdateCollectionUseCase } from '../usecases/update-collection.use-case';
import {
  CreateCollectionDto, UpdateCollectionDto,
  CreateCollectionLabelDto, UpdateCollectionLabelDto,
  CollectionResponseDto, CollectionLabelDto,
} from '../dtos';

@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly listCollections: ListCollectionsUseCase,
    private readonly createCollection: CreateCollectionUseCase,
    private readonly updateCollection: UpdateCollectionUseCase,
    private readonly deleteCollection: DeleteCollectionUseCase,
    private readonly createCollectionLabel: CreateCollectionLabelUseCase,
    private readonly updateCollectionLabel: UpdateCollectionLabelUseCase,
    private readonly deleteCollectionLabel: DeleteCollectionLabelUseCase,
  ) {}

  @Get()
  list(): Promise<CollectionResponseDto[]> { return this.listCollections.execute(); }

  @Post()
  create(@Body() dto: CreateCollectionDto): Promise<CollectionResponseDto> {
    return this.createCollection.execute(dto.name, dto.order);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto): Promise<CollectionResponseDto> {
    return this.updateCollection.execute(id, { name: dto.name, order: dto.order });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> { return this.deleteCollection.execute(id); }

  @Post(':id/labels')
  createLabel(@Param('id') collectionId: string, @Body() dto: CreateCollectionLabelDto): Promise<CollectionLabelDto> {
    return this.createCollectionLabel.execute(collectionId, dto.value, dto.order);
  }

  @Patch(':id/labels/:labelId')
  updateLabel(
    @Param('id') collectionId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateCollectionLabelDto,
  ): Promise<CollectionLabelDto> {
    return this.updateCollectionLabel.execute(collectionId, labelId, { value: dto.value, order: dto.order });
  }

  @Delete(':id/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLabel(@Param('id') collectionId: string, @Param('labelId') labelId: string): Promise<void> {
    return this.deleteCollectionLabel.execute(collectionId, labelId);
  }
}
