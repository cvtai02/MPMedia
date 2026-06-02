import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException } from '../../../shared/errors/app-exceptions';
import { CollectionResponseDto } from '../dtos';
import { mapCollection } from './collection.mapper';

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(name: string, order?: number): Promise<CollectionResponseDto> {
    const existing = await this.prisma.collection.findUnique({ where: { name } });
    if (existing) throw new ConflictException(`Collection "${name}" already exists`);
    const count = await this.prisma.collection.count();
    const row = await this.prisma.collection.create({
      data: { name, order: order ?? count },
      include: { labels: true },
    });
    return mapCollection(row);
  }
}
