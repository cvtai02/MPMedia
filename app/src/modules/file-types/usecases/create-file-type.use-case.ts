import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException } from '../../../shared/errors/app-exceptions';
import { FileTypeResponseDto } from '../dtos';

@Injectable()
export class CreateFileTypeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(name: string, openStrategy?: string, order?: number): Promise<FileTypeResponseDto> {
    const existing = await this.prisma.fileType.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`FileType "${name}" already exists`);
    const count = await this.prisma.fileType.count();
    return this.prisma.fileType.create({
      data: { name, openStrategy: openStrategy ?? 'download', order: order ?? count },
    });
  }
}
