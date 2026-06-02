import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '../../../shared/errors/app-exceptions';
import { CollectionLabelDto } from '../dtos';

@Injectable()
export class UpdateCollectionLabelUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    collectionId: string,
    labelId: string,
    patch: { value?: string; order?: number },
  ): Promise<CollectionLabelDto> {
    const label = await this.prisma.collectionLabel.findUnique({ where: { id: labelId } });
    if (!label || label.collectionId !== collectionId) throw new NotFoundException('CollectionLabel', labelId);
    return this.prisma.collectionLabel.update({ where: { id: labelId }, data: patch });
  }
}
