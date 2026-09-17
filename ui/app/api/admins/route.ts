import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function mapAdmin(a: { id: string; email: string; displayName: string | null; role: string; isActive: boolean; createdAt: Date; updatedAt: Date }) {
  return { id: a.id, email: a.email, displayName: a.displayName, role: a.role, isActive: a.isActive, createdAt: a.createdAt, updatedAt: a.updatedAt };
}

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json((await prisma.adminAccount.findMany({ orderBy: { createdAt: 'asc' } })).map(mapAdmin));
}

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { email, password, displayName, role } = await req.json();
  const existing = await prisma.adminAccount.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ message: `Admin with email "${email}" already exists` }, { status: 409 });
  const admin = await prisma.adminAccount.create({
    data: { email, passwordHash: await bcrypt.hash(password, 10), displayName: displayName ?? null, role },
  });
  return NextResponse.json(mapAdmin(admin), { status: 201 });
}
