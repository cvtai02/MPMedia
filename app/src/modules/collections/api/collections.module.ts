import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CreateCollectionLabelUseCase } from '../usecases/create-collection-label.use-case';
import { CreateCollectionUseCase } from '../usecases/create-collection.use-case';
import { DeleteCollectionLabelUseCase } from '../usecases/delete-collection-label.use-case';
import { DeleteCollectionUseCase } from '../usecases/delete-collection.use-case';
import { ListCollectionsUseCase } from '../usecases/list-collections.use-case';
import { UpdateCollectionLabelUseCase } from '../usecases/update-collection-label.use-case';
import { UpdateCollectionUseCase } from '../usecases/update-collection.use-case';

const collectionUseCases = [
  ListCollectionsUseCase,
  CreateCollectionUseCase,
  UpdateCollectionUseCase,
  DeleteCollectionUseCase,
  CreateCollectionLabelUseCase,
  UpdateCollectionLabelUseCase,
  DeleteCollectionLabelUseCase,
];

@Module({ controllers: [CollectionsController], providers: collectionUseCases, exports: collectionUseCases })
export class CollectionsModule {}
