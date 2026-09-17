import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from './settings';

export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const settings = await getSettings();
  if (settings.auth.adminToken && token === settings.auth.adminToken) return null;
  if (settings.auth.clientTokens.some(t => t.value === token)) return null;

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
