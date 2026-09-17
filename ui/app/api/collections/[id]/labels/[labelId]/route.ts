import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

type P = { params: Promise<{ id: string; labelId: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id: collectionId, labelId } = await params;

  const label = await prisma.collectionLabel.findUnique({ where: { id: labelId } });
  if (!label || label.collectionId !== collectionId) {
    return NextResponse.json({ message: `CollectionLabel "${labelId}" not found` }, { status: 404 });
  }

  const { value, order } = await req.json();
  const updated = await prisma.collectionLabel.update({
    where: { id: labelId },
    data: { ...(value !== undefined && { value }), ...(order !== undefined && { order }) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id: collectionId, labelId } = await params;

  const label = await prisma.collectionLabel.findUnique({ where: { id: labelId } });
  if (!label || label.collectionId !== collectionId) {
    return NextResponse.json({ message: `CollectionLabel "${labelId}" not found` }, { status: 404 });
  }

  const inUse = await prisma.mediaItemCollectionLabel.count({ where: { collectionLabelId: labelId } });
  if (inUse > 0) {
    return NextResponse.json({
      message: `Label "${label.value}" is assigned to ${inUse} file${inUse > 1 ? 's' : ''}`,
    }, { status: 409 });
  }

  await prisma.collectionLabel.delete({ where: { id: labelId } });
  return new NextResponse(null, { status: 204 });
}
