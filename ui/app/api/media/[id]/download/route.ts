import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { routerDownload } from '@/lib/router-storage';

type P = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;

  const item = await prisma.mediaItem.findUnique({
    where: { id },
    include: { files: { where: { isPrimary: true } } },
  });
  if (!item || item.status === 'Deleted') {
    return NextResponse.json({ message: `MediaItem "${id}" not found` }, { status: 404 });
  }
  const primaryFile = item.files[0];
  if (!primaryFile) {
    return NextResponse.json({ message: `No file for "${id}"` }, { status: 404 });
  }

  let buffer: Buffer;
  if (primaryFile.isCached && primaryFile.localCachePath) {
    const fs = await import('fs/promises');
    buffer = await fs.readFile(primaryFile.localCachePath);
  } else {
    buffer = await routerDownload(primaryFile.routerPath);
  }

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': item.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(item.originalName)}"`,
      'Content-Length': String(buffer.byteLength),
    },
  });
}
