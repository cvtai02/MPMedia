import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ConflictException, NotFoundException } from '../../../shared/errors/app-exceptions';

@Injectable()
export class DeleteCollectionLabelUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(collectionId: string, labelId: string): Promise<void> {
    const label = await this.prisma.collectionLabel.findUnique({ where: { id: labelId } });
    if (!label || label.collectionId !== collectionId) throw new NotFoundException('CollectionLabel', labelId);
    const inUse = await this.prisma.mediaItemCollectionLabel.count({ where: { collectionLabelId: labelId } });
    if (inUse > 0) {
      throw new ConflictException(`Label "${label.value}" is assigned to ${inUse} file${inUse > 1 ? 's' : ''}`);
    }
    await this.prisma.collectionLabel.delete({ where: { id: labelId } });
  }
}
