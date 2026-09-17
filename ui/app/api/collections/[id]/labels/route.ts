import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

type P = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id: collectionId } = await params;

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection) return NextResponse.json({ message: `Collection "${collectionId}" not found` }, { status: 404 });

  const { value, order } = await req.json();
  const existing = await prisma.collectionLabel.findUnique({
    where: { collectionId_value: { collectionId, value } },
  });
  if (existing) return NextResponse.json({ message: `Label "${value}" already exists in this collection` }, { status: 409 });

  const count = await prisma.collectionLabel.count({ where: { collectionId } });
  const label = await prisma.collectionLabel.create({ data: { collectionId, value, order: order ?? count } });
  return NextResponse.json(label, { status: 201 });
}
