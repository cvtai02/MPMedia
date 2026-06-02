import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ListMediaQueryDto, PaginatedMediaResponseDto } from '../dtos';
import { mapMediaItem, MEDIA_ITEM_INCLUDE } from './media-item.mapper';

@Injectable()
export class ListMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMediaQueryDto): Promise<PaginatedMediaResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MediaItemWhereInput = {
      status: { not: 'Deleted' },
      ...(query.mediaType && { mediaType: query.mediaType }),
      ...(query.status && { status: query.status }),
      ...(query.collectionLabelId && { collectionLabels: { some: { collectionLabelId: query.collectionLabelId } } }),
      ...(query.unlabeled && { collectionLabels: { none: {} } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.mediaItem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: MEDIA_ITEM_INCLUDE }),
      this.prisma.mediaItem.count({ where }),
    ]);

    return { data: items.map(mapMediaItem), total, page, limit };
  }
}
