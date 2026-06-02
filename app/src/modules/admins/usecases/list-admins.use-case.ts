import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AdminResponseDto } from '../dtos';

@Injectable()
export class ListAdminsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<AdminResponseDto[]> {
    const admins = await this.prisma.adminAccount.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return admins.map((a) => ({
      id: a.id,
      email: a.email,
      displayName: a.displayName,
      role: a.role,
      isActive: a.isActive,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  }
}
