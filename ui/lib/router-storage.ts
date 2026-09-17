import { prisma } from './prisma';
import { Readable } from 'stream';

const ROUTER_BASE_URL = 'http://localhost:20131';
const SINGLETON_ID = 'singleton';

async function getRouterConfig() {
  const record = await prisma.routerSetting.findUnique({ where: { id: SINGLETON_ID } });
  return { accessToken: record?.accessToken ?? '', basePath: record?.basePath ?? '' };
}

export async function routerUpload(
  mediaItemId: string,
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<{ routerPath: string; cdnUrl?: string }> {
  const { accessToken, basePath } = await getRouterConfig();
  const routerPath = `${basePath}/media/${mediaItemId}/${filename}`;
  const res = await fetch(`${ROUTER_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ absolutePath: routerPath, contentBase64: buffer.toString('base64'), contentType }),
  });
  if (!res.ok && res.status !== 204) throw new Error(`Router upload failed: ${res.status}`);
  return { routerPath };
}

export async function routerListAll(
  path: string,
): Promise<Array<{ name: string; absolutePath: string; sizeBytes: number; cdnUrl?: string }>> {
  const { accessToken } = await getRouterConfig();
  const res = await fetch(`${ROUTER_BASE_URL}/files/all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error(`Router list-all failed: ${res.status}`);
  const data = await res.json() as { items: Array<{ name: string; absolutePath: string; sizeBytes: number; cdnUrl?: string }> };
  return data.items;
}

export async function routerDownload(routerPath: string): Promise<Buffer> {
  const { accessToken } = await getRouterConfig();
  const res = await fetch(`${ROUTER_BASE_URL}/files/get`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ absolutePath: routerPath }),
  });
  if (!res.ok) throw new Error(`Router download failed: ${res.status}`);
  const data = await res.json() as { file: { contentBase64: string } };
  return Buffer.from(data.file.contentBase64, 'base64');
}

export { Readable };
