import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  return NextResponse.json({ id: 'admin', email: 'admin', displayName: 'Admin', role: 'admin', isActive: true });
}
