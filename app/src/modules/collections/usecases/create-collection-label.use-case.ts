import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException, NotFoundException } from '../../../shared/errors/app-exceptions';
import { CollectionLabelDto } from '../dtos';

@Injectable()
export class CreateCollectionLabelUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(collectionId: string, value: string, order?: number): Promise<CollectionLabelDto> {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('Collection', collectionId);
    const existing = await this.prisma.collectionLabel.findUnique({
      where: { collectionId_value: { collectionId, value } },
    });
    if (existing) throw new ConflictException(`Label "${value}" already exists in this collection`);
    const count = await this.prisma.collectionLabel.count({ where: { collectionId } });
    return this.prisma.collectionLabel.create({ data: { collectionId, value, order: order ?? count } });
  }
}
