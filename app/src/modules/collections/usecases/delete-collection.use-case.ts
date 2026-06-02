import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException, NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class DeleteCollectionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const existing = await this.prisma.collection.findUnique({ where: { id }, include: { labels: true } });
    if (!existing) throw new NotFoundException('Collection', id);
    if (existing.labels.length > 0) {
      throw new ConflictException(
        `Collection "${existing.name}" still has ${existing.labels.length} label${existing.labels.length > 1 ? 's' : ''} - remove them first`,
      );
    }
    await this.prisma.collection.delete({ where: { id } });
  }
}
