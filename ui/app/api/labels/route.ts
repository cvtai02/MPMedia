import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json(await prisma.label.findMany({ orderBy: { name: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { name, color } = await req.json();
  const existing = await prisma.label.findUnique({ where: { name } });
  if (existing) return NextResponse.json({ message: `Label "${name}" already exists` }, { status: 409 });
  return NextResponse.json(await prisma.label.create({ data: { name, color } }), { status: 201 });
}
