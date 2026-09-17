import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';

const ID = 'singleton';

function toDto(r: { id: string; accessToken: string; basePath: string; createdAt: Date; updatedAt: Date }) {
  return { id: r.id, accessToken: r.accessToken, basePath: r.basePath, createdAt: r.createdAt, updatedAt: r.updatedAt };
}

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json(toDto(await prisma.routerSetting.upsert({
    where: { id: ID }, create: { id: ID, accessToken: '', basePath: '' }, update: {},
  })));
}

export async function PATCH(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { accessToken, basePath } = await req.json();
  return NextResponse.json(toDto(await prisma.routerSetting.upsert({
    where: { id: ID },
    create: { id: ID, accessToken: accessToken ?? '', basePath: basePath ?? '' },
    update: { ...(accessToken !== undefined && { accessToken }), ...(basePath !== undefined && { basePath }) },
  })));
}
