import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { CreateAdminUseCase } from '../usecases/create-admin.use-case';
import { UpdateAdminUseCase } from '../usecases/update-admin.use-case';
import { DisableAdminUseCase } from '../usecases/disable-admin.use-case';
import { ListAdminsUseCase } from '../usecases/list-admins.use-case';

@Module({
  controllers: [AdminsController],
  providers: [ListAdminsUseCase, CreateAdminUseCase, UpdateAdminUseCase, DisableAdminUseCase],
})
export class AdminsModule {}
