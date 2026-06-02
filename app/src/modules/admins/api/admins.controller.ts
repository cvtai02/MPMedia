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
  Request,
} from '@nestjs/common';
import { CreateAdminUseCase } from '../usecases/create-admin.use-case';
import { UpdateAdminUseCase } from '../usecases/update-admin.use-case';
import { DisableAdminUseCase } from '../usecases/disable-admin.use-case';
import { ListAdminsUseCase } from '../usecases/list-admins.use-case';
import { CreateAdminRequestDto, UpdateAdminRequestDto, AdminResponseDto } from '../dtos';
import { JwtPayload } from '../../../infrastructure/auth/jwt-payload.interface';

@Controller('admins')
export class AdminsController {
  constructor(
    private readonly listAdmins: ListAdminsUseCase,
    private readonly createAdmin: CreateAdminUseCase,
    private readonly updateAdmin: UpdateAdminUseCase,
    private readonly disableAdmin: DisableAdminUseCase,
  ) {}

  @Get()
  list(): Promise<AdminResponseDto[]> {
    return this.listAdmins.execute();
  }

  @Post()
  create(@Body() dto: CreateAdminRequestDto): Promise<AdminResponseDto> {
    return this.createAdmin.execute({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
      role: dto.role,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRequestDto,
  ): Promise<AdminResponseDto> {
    return this.updateAdmin.execute(id, {
      displayName: dto.displayName,
      role: dto.role,
      isActive: dto.isActive,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  disable(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    return this.disableAdmin.execute(id, req.user.sub);
  }
}
