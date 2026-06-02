import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class DisableAdminUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, requestingAdminId: string): Promise<void> {
    if (id === requestingAdminId) throw new ForbiddenException('Cannot disable your own account');

    const admin = await this.prisma.adminAccount.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('AdminAccount', id);

    await this.prisma.adminAccount.update({ where: { id }, data: { isActive: false } });
  }
}
