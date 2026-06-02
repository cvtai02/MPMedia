import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { AdminResponseDto } from '../dtos';

export interface UpdateAdminInput {
  displayName?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateAdminUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, input: UpdateAdminInput): Promise<AdminResponseDto> {
    const existing = await this.prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('AdminAccount', id);

    const admin = await this.prisma.adminAccount.update({
      where: { id },
      data: {
        displayName: input.displayName ?? existing.displayName,
        role: input.role ?? existing.role,
        isActive: input.isActive ?? existing.isActive,
      },
    });

    return {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
