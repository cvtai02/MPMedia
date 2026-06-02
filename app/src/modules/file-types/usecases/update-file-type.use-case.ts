import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { FileTypeResponseDto } from '../dtos';

@Injectable()
export class UpdateFileTypeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    patch: { name?: string; openStrategy?: string; order?: number },
  ): Promise<FileTypeResponseDto> {
    const existing = await this.prisma.fileType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FileType', id);
    return this.prisma.fileType.update({ where: { id }, data: patch });
  }
}
