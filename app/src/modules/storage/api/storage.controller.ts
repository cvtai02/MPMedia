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
} from '@nestjs/common';
import { ListStorageProvidersUseCase } from '../usecases/list-storage-providers.use-case';
import { CreateStorageProviderUseCase } from '../usecases/create-storage-provider.use-case';
import { UpdateStorageProviderUseCase } from '../usecases/update-storage-provider.use-case';
import { SetActiveStorageProviderUseCase } from '../usecases/set-active-storage-provider.use-case';
import { TestStorageProviderUseCase } from '../usecases/test-storage-provider.use-case';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import {
  CreateStorageProviderRequestDto,
  UpdateStorageProviderRequestDto,
  StorageProviderResponseDto,
} from '../dtos';
import { StorageHealthStatus } from '../../../infrastructure/storage-providers/media-storage-provider.interface';

@Controller('storage-providers')
export class StorageController {
  constructor(
    private readonly listProviders: ListStorageProvidersUseCase,
    private readonly createProvider: CreateStorageProviderUseCase,
    private readonly updateProvider: UpdateStorageProviderUseCase,
    private readonly activateProvider: SetActiveStorageProviderUseCase,
    private readonly testProvider: TestStorageProviderUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  list(): Promise<StorageProviderResponseDto[]> {
    return this.listProviders.execute();
  }

  @Post()
  create(@Body() dto: CreateStorageProviderRequestDto): Promise<StorageProviderResponseDto> {
    return this.createProvider.execute({ name: dto.name, type: dto.type, settings: dto.settings });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStorageProviderRequestDto,
  ): Promise<StorageProviderResponseDto> {
    return this.updateProvider.execute(id, { name: dto.name, settings: dto.settings });
  }

  @Post(':id/activate')
  activate(@Param('id') id: string): Promise<StorageProviderResponseDto> {
    return this.activateProvider.execute(id);
  }

  @Post(':id/test')
  test(@Param('id') id: string): Promise<StorageHealthStatus> {
    return this.testProvider.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const row = await this.prisma.storageProviderSetting.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('StorageProvider', id);
    await this.prisma.storageProviderSetting.delete({ where: { id } });
  }
}
