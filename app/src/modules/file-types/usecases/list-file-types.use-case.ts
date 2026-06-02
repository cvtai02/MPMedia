import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FileTypeResponseDto } from '../dtos';

@Injectable()
export class ListFileTypesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<FileTypeResponseDto[]> {
    return this.prisma.fileType.findMany({ orderBy: { order: 'asc' } });
  }
}
