import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { CollectionResponseDto } from '../dtos';
import { mapCollection } from './collection.mapper';

@Injectable()
export class ListCollectionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CollectionResponseDto[]> {
    const rows = await this.prisma.collection.findMany({
      orderBy: { order: 'asc' },
      include: { labels: { orderBy: { order: 'asc' } } },
    });
    return rows.map(mapCollection);
  }
}
