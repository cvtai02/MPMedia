import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { MEDIA_ITEM_INCLUDE, mapMediaItem } from '@/lib/media-mapper';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') ?? 1));
  const limit = Math.max(1, Number(sp.get('limit') ?? 20));
  const skip = (page - 1) * limit;
  const mediaType = sp.get('mediaType') ?? undefined;
  const status = sp.get('status') ?? undefined;
  const collectionLabelId = sp.get('collectionLabelId') ?? undefined;
  const unlabeled = sp.get('unlabeled') === 'true';

  const where: Prisma.MediaItemWhereInput = {
    status: { not: 'Deleted' },
    ...(mediaType && { mediaType }),
    ...(status && { status }),
    ...(collectionLabelId && { collectionLabels: { some: { collectionLabelId } } }),
    ...(unlabeled && { collectionLabels: { none: {} } }),
  };

  const [items, total] = await Promise.all([
    prisma.mediaItem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: MEDIA_ITEM_INCLUDE }),
    prisma.mediaItem.count({ where }),
  ]);

  return NextResponse.json({ data: items.map(mapMediaItem), total, page, limit });
}
