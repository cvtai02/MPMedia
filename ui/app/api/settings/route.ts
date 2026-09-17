import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';
import { getSettings, updateSettings } from '@/lib/settings';

function toDto(s: Awaited<ReturnType<typeof getSettings>>) {
  return { cache: s.cache, backup: s.backup };
}

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json(toDto(await getSettings()));
}

export async function PATCH(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json(toDto(await updateSettings(await req.json())));
}
