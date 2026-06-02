import { Module } from '@nestjs/common';
import { LabelsController } from './labels.controller';
import { CreateLabelUseCase } from '../usecases/create-label.use-case';
import { UpdateLabelUseCase } from '../usecases/update-label.use-case';
import { DeleteLabelUseCase } from '../usecases/delete-label.use-case';
import { ListLabelsUseCase } from '../usecases/list-labels.use-case';
import { AssignLabelToMediaUseCase } from '../usecases/assign-label-to-media.use-case';
import { RemoveLabelFromMediaUseCase } from '../usecases/remove-label-from-media.use-case';

@Module({
  controllers: [LabelsController],
  providers: [
    CreateLabelUseCase,
    UpdateLabelUseCase,
    DeleteLabelUseCase,
    ListLabelsUseCase,
    AssignLabelToMediaUseCase,
    RemoveLabelFromMediaUseCase,
  ],
  exports: [AssignLabelToMediaUseCase, RemoveLabelFromMediaUseCase],
})
export class LabelsModule {}
