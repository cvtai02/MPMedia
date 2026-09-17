import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json(await prisma.fileType.findMany({ orderBy: { order: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { name, openStrategy, order } = await req.json();
  const existing = await prisma.fileType.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ message: `FileType "${name}" already exists` }, { status: 409 });
  const count = await prisma.fileType.count();
  return NextResponse.json(await prisma.fileType.create({
    data: { name, openStrategy: openStrategy ?? 'download', order: order ?? count },
  }), { status: 201 });
}
