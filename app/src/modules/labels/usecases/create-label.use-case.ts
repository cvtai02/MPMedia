import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException } from '../../../shared/errors/app-exceptions';
import { LabelResponseDto } from '../dtos';

@Injectable()
export class CreateLabelUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(name: string, color: string): Promise<LabelResponseDto> {
    const existing = await this.prisma.label.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Label with name "${name}" already exists`);

    const label = await this.prisma.label.create({ data: { name, color } });
    return label;
  }
}
