import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { routerDownload } from '@/lib/router-storage';
import { MEDIA_ITEM_INCLUDE, mapMediaItem } from '@/lib/media-mapper';
import { sanitizeFilename } from '@/lib/media-type';

type P = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id }, include: { files: true, ...MEDIA_ITEM_INCLUDE } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }

  const primaryFile = item.files.find(f => f.isPrimary);
  if (!primaryFile) {
    return NextResponse.json({ message: `No primary file for "${id}"` }, { status: 404 });
  }

  if (primaryFile.isCached && primaryFile.localCachePath) {
    const exists = await fs.promises.access(primaryFile.localCachePath).then(() => true).catch(() => false);
    if (exists) {
      return NextResponse.json({ ...mapMediaItem(item), files: item.files.map(f => ({ id: f.id, routerPath: f.routerPath, cdnUrl: f.cdnUrl, isPrimary: f.isPrimary, isCached: f.isCached, localCachePath: f.localCachePath })) });
    }
  }

  const settings = await getSettings();
  const localPath = path.join(settings.cache.path, item.id, primaryFile.id, sanitizeFilename(item.originalName));
  await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

  const buffer = await routerDownload(primaryFile.routerPath);
  await fs.promises.writeFile(localPath, buffer);

  const updatedFile = await prisma.mediaFile.update({
    where: { id: primaryFile.id },
    data: { isCached: true, localCachePath: localPath },
  });

  const updatedItem = await prisma.mediaItem.update({
    where: { id },
    data: { status: 'Cached' },
    include: MEDIA_ITEM_INCLUDE,
  });

  const allFiles = item.files.map(f => (f.id === updatedFile.id ? updatedFile : f));
  return NextResponse.json({
    ...mapMediaItem(updatedItem),
    files: allFiles.map(f => ({ id: f.id, routerPath: f.routerPath, cdnUrl: f.cdnUrl, isPrimary: f.isPrimary, isCached: f.isCached, localCachePath: f.localCachePath })),
  });
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({ where: { id }, include: { files: { where: { isCached: true } } } });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }

  for (const file of item.files) {
    if (file.localCachePath) {
      const dir = path.dirname(file.localCachePath);
      await fs.promises.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
    await prisma.mediaFile.update({ where: { id: file.id }, data: { isCached: false, localCachePath: null } });
  }

  const updatedItem = await prisma.mediaItem.update({
    where: { id },
    data: { status: 'Uploaded' },
    include: MEDIA_ITEM_INCLUDE,
  });

  return NextResponse.json(mapMediaItem(updatedItem));
}
