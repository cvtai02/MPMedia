import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { mapCollection } from '@/lib/collection-mapper';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const rows = await prisma.collection.findMany({
    orderBy: { order: 'asc' },
    include: { labels: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(rows.map(mapCollection));
}

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { name, order } = await req.json();
  const existing = await prisma.collection.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ message: `Collection "${name}" already exists` }, { status: 409 });
  const count = await prisma.collection.count();
  const row = await prisma.collection.create({
    data: { name, order: order ?? count },
    include: { labels: true },
  });
  return NextResponse.json(mapCollection(row), { status: 201 });
}
