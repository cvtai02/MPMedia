import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException } from '../../../shared/errors/app-exceptions';
import { AdminResponseDto } from '../dtos';

export interface CreateAdminInput {
  email: string;
  password: string;
  displayName?: string;
  role: string;
}

@Injectable()
export class CreateAdminUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateAdminInput): Promise<AdminResponseDto> {
    const existing = await this.prisma.adminAccount.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException(`Admin with email "${input.email}" already exists`);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const admin = await this.prisma.adminAccount.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName ?? null,
        role: input.role,
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
