import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { MeResponseDto } from '../dtos';

@Injectable()
export class GetCurrentAdminUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(adminId: string): Promise<MeResponseDto> {
    const admin = await this.prisma.adminAccount.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('AdminAccount', adminId);

    return {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      isActive: admin.isActive,
    };
  }
}
