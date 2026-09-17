import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { MEDIA_ITEM_INCLUDE, mapMediaItem } from '@/lib/media-mapper';

type P = { params: Promise<{ id: string; collectionLabelId: string }> };

export async function POST(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id: mediaId, collectionLabelId } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${mediaId}" not found` }, { status: 404 });
  }

  const label = await prisma.collectionLabel.findUnique({ where: { id: collectionLabelId } });
  if (!label) {
    return NextResponse.json({ message: `CollectionLabel "${collectionLabelId}" not found` }, { status: 404 });
  }

  await prisma.mediaItemCollectionLabel.upsert({
    where: { mediaItemId_collectionLabelId: { mediaItemId: mediaId, collectionLabelId } },
    create: { mediaItemId: mediaId, collectionLabelId },
    update: {},
  });

  const updated = await prisma.mediaItem.findUnique({ where: { id: mediaId }, include: MEDIA_ITEM_INCLUDE });
  return NextResponse.json(mapMediaItem(updated!));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id: mediaId, collectionLabelId } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${mediaId}" not found` }, { status: 404 });
  }

  await prisma.mediaItemCollectionLabel.deleteMany({ where: { mediaItemId: mediaId, collectionLabelId } });

  const updated = await prisma.mediaItem.findUnique({ where: { id: mediaId }, include: MEDIA_ITEM_INCLUDE });
  return NextResponse.json(mapMediaItem(updated!));
}
