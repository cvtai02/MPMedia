import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { LabelResponseDto } from '../dtos';

@Injectable()
export class UpdateLabelUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, patch: { name?: string; color?: string }): Promise<LabelResponseDto> {
    const existing = await this.prisma.label.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Label', id);

    return this.prisma.label.update({ where: { id }, data: patch });
  }
}
