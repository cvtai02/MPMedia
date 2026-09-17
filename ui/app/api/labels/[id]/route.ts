import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.label.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `Label "${id}" not found` }, { status: 404 });
  return NextResponse.json(await prisma.label.update({ where: { id }, data: await req.json() }));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.label.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `Label "${id}" not found` }, { status: 404 });
  await prisma.label.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
