import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.fileType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `FileType "${id}" not found` }, { status: 404 });
  return NextResponse.json(await prisma.fileType.update({ where: { id }, data: await req.json() }));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.fileType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `FileType "${id}" not found` }, { status: 404 });
  const inUse = await prisma.mediaItem.count({ where: { fileTypeId: id } });
  if (inUse > 0) return NextResponse.json({ message: `File type "${existing.name}" is used by ${inUse} item${inUse > 1 ? 's' : ''}` }, { status: 409 });
  await prisma.fileType.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
