import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { mapCollection } from '@/lib/collection-mapper';

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.collection.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `Collection "${id}" not found` }, { status: 404 });
  const { name, order } = await req.json();
  const row = await prisma.collection.update({
    where: { id },
    data: { ...(name !== undefined && { name }), ...(order !== undefined && { order }) },
    include: { labels: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(mapCollection(row));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.collection.findUnique({ where: { id }, include: { labels: true } });
  if (!existing) return NextResponse.json({ message: `Collection "${id}" not found` }, { status: 404 });
  if (existing.labels.length > 0) {
    return NextResponse.json({
      message: `Collection "${existing.name}" still has ${existing.labels.length} label${existing.labels.length > 1 ? 's' : ''} - remove them first`,
    }, { status: 409 });
  }
  await prisma.collection.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
