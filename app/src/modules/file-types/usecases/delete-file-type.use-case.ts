import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException, NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class DeleteFileTypeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.fileType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FileType', id);
    const inUse = await this.prisma.mediaItem.count({ where: { fileTypeId: id } });
    if (inUse > 0) {
      throw new ConflictException(`File type "${existing.name}" is assigned to ${inUse} file${inUse > 1 ? 's' : ''}`);
    }
    await this.prisma.fileType.delete({ where: { id } });
  }
}
