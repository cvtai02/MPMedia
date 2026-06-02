import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateFileTypeUseCase } from '../usecases/create-file-type.use-case';
import { DeleteFileTypeUseCase } from '../usecases/delete-file-type.use-case';
import { ListFileTypesUseCase } from '../usecases/list-file-types.use-case';
import { UpdateFileTypeUseCase } from '../usecases/update-file-type.use-case';
import { CreateFileTypeDto, UpdateFileTypeDto, FileTypeResponseDto } from '../dtos';

@Controller('file-types')
export class FileTypesController {
  constructor(
    private readonly listFileTypes: ListFileTypesUseCase,
    private readonly createFileType: CreateFileTypeUseCase,
    private readonly updateFileType: UpdateFileTypeUseCase,
    private readonly deleteFileType: DeleteFileTypeUseCase,
  ) {}

  @Get()
  list(): Promise<FileTypeResponseDto[]> { return this.listFileTypes.execute(); }

  @Post()
  create(@Body() dto: CreateFileTypeDto): Promise<FileTypeResponseDto> {
    return this.createFileType.execute(dto.name, dto.openStrategy, dto.order);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFileTypeDto): Promise<FileTypeResponseDto> {
    return this.updateFileType.execute(id, { name: dto.name, openStrategy: dto.openStrategy, order: dto.order });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> { return this.deleteFileType.execute(id); }
}
