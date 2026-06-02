import fetch, { Response, RequestInit } from 'node-fetch';

const BASE = process.env['API_BASE_URL'] ?? 'http://localhost:3000';
const EMAIL = process.env['API_ADMIN_EMAIL'] ?? 'admin@mpmedia.local';
const PASSWORD = process.env['API_ADMIN_PASSWORD'] ?? 'admin123';

let token: string | null = null;

async function login(): Promise<void> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = (await res.json()) as { accessToken: string };
  token = data.accessToken;
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!token) await login();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> ?? {}) },
  });
  if (res.status === 401) {
    // token expired — re-login once
    token = null;
    const retryHeaders = await authHeaders();
    const retry = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...retryHeaders, ...(init.headers as Record<string, string> ?? {}) },
    });
    if (!retry.ok && retry.status !== 204) throw new Error(`${retry.status} ${await retry.text()}`);
    if (retry.status === 204) return undefined as T;
    return retry.json() as Promise<T>;
  }
  if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function uploadFile<T>(path: string, filename: string, buffer: Buffer, mimeType: string): Promise<T> {
  if (!token) await login();
  const form = new FormData();
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  form.append('file', new Blob([ab], { type: mimeType }), filename);
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form as never,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export { BASE };
