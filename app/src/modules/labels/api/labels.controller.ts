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
import { CreateLabelUseCase } from '../usecases/create-label.use-case';
import { UpdateLabelUseCase } from '../usecases/update-label.use-case';
import { DeleteLabelUseCase } from '../usecases/delete-label.use-case';
import { ListLabelsUseCase } from '../usecases/list-labels.use-case';
import { CreateLabelRequestDto, UpdateLabelRequestDto, LabelResponseDto } from '../dtos';

@Controller('labels')
export class LabelsController {
  constructor(
    private readonly createLabel: CreateLabelUseCase,
    private readonly updateLabel: UpdateLabelUseCase,
    private readonly deleteLabel: DeleteLabelUseCase,
    private readonly listLabels: ListLabelsUseCase,
  ) {}

  @Get()
  list(): Promise<LabelResponseDto[]> {
    return this.listLabels.execute();
  }

  @Post()
  create(@Body() dto: CreateLabelRequestDto): Promise<LabelResponseDto> {
    return this.createLabel.execute(dto.name, dto.color);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLabelRequestDto): Promise<LabelResponseDto> {
    return this.updateLabel.execute(id, { name: dto.name, color: dto.color });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.deleteLabel.execute(id);
  }
}
