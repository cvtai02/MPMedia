import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

type P = { params: Promise<{ id: string }> };

function mapAdmin(a: { id: string; email: string; displayName: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date }) {
  return { id: a.id, email: a.email, displayName: a.displayName, role: a.role, isActive: a.isActive, createdAt: a.createdAt, updatedAt: a.updatedAt };
}

export async function PATCH(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.adminAccount.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `AdminAccount "${id}" not found` }, { status: 404 });
  const patch = await req.json();
  return NextResponse.json(mapAdmin(await prisma.adminAccount.update({
    where: { id },
    data: { displayName: patch.displayName ?? existing.displayName, role: patch.role ?? existing.role, isActive: patch.isActive ?? existing.isActive },
  })));
}

export async function DELETE(req: NextRequest, { params }: P) {
  const err = await requireAuth(req);
  if (err) return err;
  const { id } = await params;
  const existing = await prisma.adminAccount.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `AdminAccount "${id}" not found` }, { status: 404 });
  await prisma.adminAccount.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
