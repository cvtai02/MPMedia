import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
  const err = await requireAuth(req);
  if (err) return err;
  const { description } = await req.json();
  if (!description || typeof description !== 'string') {
    return NextResponse.json({ message: 'description is required' }, { status: 400 });
  }
  return NextResponse.json({ items: [] });
}
