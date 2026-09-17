import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { routerListAll } from '@/lib/router-storage';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;

  const setting = await prisma.routerSetting.findUnique({ where: { id: 'singleton' } });
  const routerFiles = await routerListAll(setting?.basePath ?? '');
  const routerPaths = routerFiles.map(f => f.absolutePath);

  const mediaFiles = await prisma.mediaFile.findMany({
    where: { routerPath: { in: routerPaths } },
    include: { mediaItem: { include: { labels: true } } },
  });
  const map = new Map(mediaFiles.map(mf => [mf.routerPath, mf]));

  const unlabeled = routerFiles.filter(f => {
    const mf = map.get(f.absolutePath);
    return !mf || mf.mediaItem.labels.length === 0;
  });

  return NextResponse.json({
    total: unlabeled.length,
    items: unlabeled.map(f => {
      const mf = map.get(f.absolutePath);
      return {
        absolutePath: f.absolutePath, name: f.name, sizeBytes: f.sizeBytes, cdnUrl: f.cdnUrl ?? null,
        tracked: !!mf,
        mediaItem: mf ? { id: mf.mediaItem.id, originalName: mf.mediaItem.originalName, mimeType: mf.mediaItem.mimeType, mediaType: mf.mediaItem.mediaType, status: mf.mediaItem.status } : null,
      };
    }),
  });
}
