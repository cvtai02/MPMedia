import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ message: 'Token required' }, { status: 400 });
  const settings = await getSettings();
  if (!settings.auth.adminToken || token !== settings.auth.adminToken)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  return NextResponse.json({ accessToken: token });
}
