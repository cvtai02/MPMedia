import { Module } from '@nestjs/common';
import { FileTypesController } from './file-types.controller';
import { CreateFileTypeUseCase } from '../usecases/create-file-type.use-case';
import { DeleteFileTypeUseCase } from '../usecases/delete-file-type.use-case';
import { ListFileTypesUseCase } from '../usecases/list-file-types.use-case';
import { UpdateFileTypeUseCase } from '../usecases/update-file-type.use-case';

const fileTypeUseCases = [
  ListFileTypesUseCase,
  CreateFileTypeUseCase,
  UpdateFileTypeUseCase,
  DeleteFileTypeUseCase,
];

@Module({ controllers: [FileTypesController], providers: fileTypeUseCases, exports: fileTypeUseCases })
export class FileTypesModule {}
