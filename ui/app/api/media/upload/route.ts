import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { routerUpload } from '@/lib/router-storage';
import { inferMediaType, sanitizeFilename } from '@/lib/media-type';

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ message: 'file is required' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const originalName = file.name;
  const mimeType = file.type;

  const mediaItem = await prisma.mediaItem.create({
    data: {
      originalName,
      mimeType,
      mediaType: inferMediaType(mimeType),
      sizeBytes: BigInt(buffer.byteLength),
      checksum: createHash('sha256').update(buffer).digest('hex'),
      status: 'Uploaded',
    },
  });

  const { routerPath, cdnUrl } = await routerUpload(
    mediaItem.id,
    sanitizeFilename(originalName),
    buffer,
    mimeType,
  );

  const mediaFile = await prisma.mediaFile.create({
    data: { mediaItemId: mediaItem.id, routerPath, cdnUrl: cdnUrl ?? null, isPrimary: true, isCached: false },
  });

  return NextResponse.json({
    id: mediaItem.id,
    originalName: mediaItem.originalName,
    mimeType: mediaItem.mimeType,
    mediaType: mediaItem.mediaType,
    sizeBytes: Number(mediaItem.sizeBytes),
    checksum: mediaItem.checksum,
    status: mediaItem.status,
    fileType: null,
    collectionLabels: [],
    createdAt: mediaItem.createdAt,
    updatedAt: mediaItem.updatedAt,
    files: [{
      id: mediaFile.id,
      routerPath: mediaFile.routerPath,
      cdnUrl: mediaFile.cdnUrl,
      isPrimary: mediaFile.isPrimary,
      isCached: mediaFile.isCached,
      localCachePath: mediaFile.localCachePath,
    }],
  }, { status: 201 });
}
