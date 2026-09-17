import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { MEDIA_ITEM_INCLUDE, mapMediaItem } from '@/lib/media-mapper';

type P = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({
    where: { id },
    include: { files: true, ...MEDIA_ITEM_INCLUDE },
  });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }

  return NextResponse.json({
    ...mapMediaItem(item),
    files: item.files.map(f => ({
      id: f.id, routerPath: f.routerPath, cdnUrl: f.cdnUrl,
      isPrimary: f.isPrimary, isCached: f.isCached, localCachePath: f.localCachePath,
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }

  const { originalName } = await req.json();
  const updated = await prisma.mediaItem.update({
    where: { id },
    data: { ...(originalName !== undefined && { originalName }) },
    include: MEDIA_ITEM_INCLUDE,
  });
  return NextResponse.json(mapMediaItem(updated));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }

  await prisma.mediaItem.update({ where: { id }, data: { status: 'Deleted' } });
  return new NextResponse(null, { status: 204 });
}
