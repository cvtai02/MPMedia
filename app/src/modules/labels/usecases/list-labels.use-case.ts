import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { LabelResponseDto } from '../dtos';

@Injectable()
export class ListLabelsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<LabelResponseDto[]> {
    return this.prisma.label.findMany({ orderBy: { name: 'asc' } });
  }
}
