import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { CollectionResponseDto } from '../dtos';
import { mapCollection } from './collection.mapper';

@Injectable()
export class UpdateCollectionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, patch: { name?: string; order?: number }): Promise<CollectionResponseDto> {
    const existing = await this.prisma.collection.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Collection', id);
    const row = await this.prisma.collection.update({
      where: { id },
      data: patch,
      include: { labels: { orderBy: { order: 'asc' } } },
    });
    return mapCollection(row);
  }
}
