const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json();
}

// Auth
export const login = (email: string, password: string) =>
  request<{ accessToken: string; admin: Admin }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
export const getMe = () => request<Admin>('/auth/me');

// Media
export const listMedia = (params: Record<string, string | number | boolean>) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== false).map(([k, v]) => [k, String(v)]))
  ).toString();
  return request<PaginatedMedia>(`/media${q ? `?${q}` : ''}`);
};
export const getMedia = (id: string) => request<MediaDetail>(`/media/${id}`);
export const uploadMedia = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<MediaDetail>('/media/upload', { method: 'POST', body: form });
};
export const updateMedia = (id: string, body: { originalName: string }) =>
  request<MediaItem>(`/media/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteMedia = (id: string) => request<void>(`/media/${id}`, { method: 'DELETE' });
export const cacheMedia = (id: string) => request<MediaDetail>(`/media/${id}/cache`, { method: 'POST' });
export const clearCache = (id: string) => request<MediaItem>(`/media/${id}/cache`, { method: 'DELETE' });
export const assignCollectionLabel = (mediaId: string, collectionLabelId: string) =>
  request<MediaItem>(`/media/${mediaId}/collection-labels/${collectionLabelId}`, { method: 'POST' });
export const removeCollectionLabel = (mediaId: string, collectionLabelId: string) =>
  request<MediaItem>(`/media/${mediaId}/collection-labels/${collectionLabelId}`, { method: 'DELETE' });


// Storage Providers
export const listProviders = () => request<StorageProvider[]>('/storage-providers');
export const createProvider = (body: { name: string; type: string; settings: Record<string, string> }) =>
  request<StorageProvider>('/storage-providers', { method: 'POST', body: JSON.stringify(body) });
export const updateProvider = (id: string, body: { name?: string; settings?: Record<string, string> }) =>
  request<StorageProvider>(`/storage-providers/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const activateProvider = (id: string) =>
  request<StorageProvider>(`/storage-providers/${id}/activate`, { method: 'POST' });
export const testProvider = (id: string) =>
  request<{ healthy: boolean; message: string }>(`/storage-providers/${id}/test`, { method: 'POST' });
export const deleteProvider = (id: string) => request<void>(`/storage-providers/${id}`, { method: 'DELETE' });

// Admins
export const listAdmins = () => request<Admin[]>('/admins');
export const createAdmin = (body: { email: string; password: string; displayName?: string; role: string }) =>
  request<Admin>('/admins', { method: 'POST', body: JSON.stringify(body) });
export const updateAdmin = (id: string, body: { displayName?: string; isActive?: boolean }) =>
  request<Admin>(`/admins/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteAdmin = (id: string) => request<void>(`/admins/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => request<AppSettings>('/settings');
export const updateSettings = (body: Partial<AppSettings>) =>
  request<AppSettings>('/settings', { method: 'PATCH', body: JSON.stringify(body) });

// File Types
export const listFileTypes = () => request<FileType[]>('/file-types');
export const createFileType = (name: string, order?: number, openStrategy?: string) =>
  request<FileType>('/file-types', { method: 'POST', body: JSON.stringify({ name, order, openStrategy }) });
export const updateFileType = (id: string, patch: { name?: string; order?: number; openStrategy?: string }) =>
  request<FileType>(`/file-types/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteFileType = (id: string) => request<void>(`/file-types/${id}`, { method: 'DELETE' });

// Collections
export const listCollections = () => request<Collection[]>('/collections');
export const createCollection = (name: string, order?: number) =>
  request<Collection>('/collections', { method: 'POST', body: JSON.stringify({ name, order }) });
export const updateCollection = (id: string, patch: { name?: string; order?: number }) =>
  request<Collection>(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteCollection = (id: string) => request<void>(`/collections/${id}`, { method: 'DELETE' });
export const createCollectionLabel = (collectionId: string, value: string, order?: number) =>
  request<CollectionLabel>(`/collections/${collectionId}/labels`, { method: 'POST', body: JSON.stringify({ value, order }) });
export const updateCollectionLabel = (collectionId: string, labelId: string, patch: { value?: string; order?: number }) =>
  request<CollectionLabel>(`/collections/${collectionId}/labels/${labelId}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteCollectionLabel = (collectionId: string, labelId: string) =>
  request<void>(`/collections/${collectionId}/labels/${labelId}`, { method: 'DELETE' });

// Types
export interface CollectionLabelRef { id: string; collectionId: string; collectionName: string; value: string }
export interface FileTypeRef { id: string; name: string; openStrategy: string }
export interface MediaItem {
  id: string; originalName: string; mimeType: string; mediaType: string;
  sizeBytes: number; checksum: string; status: string; activeProvider: string | null;
  fileType: FileTypeRef | null;
  collectionLabels: CollectionLabelRef[]; createdAt: string; updatedAt: string;
}
export interface MediaFile {
  id: string; providerType: string; providerKey: string; storagePath: string | null;
  publicUrl: string | null; isPrimary: boolean; isCached: boolean; localCachePath: string | null;
}
export interface MediaDetail extends MediaItem { files: MediaFile[] }
export interface PaginatedMedia { data: MediaItem[]; total: number; page: number; limit: number }
export interface StorageProvider {
  id: string; name: string; type: string; isActive: boolean;
  settings: Record<string, string>; createdAt: string; updatedAt: string;
}
export interface Admin {
  id: string; email: string; displayName: string | null; role: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}
export interface AppSettings {
  cache: { enabled: boolean; path: string; maxSizeMb: number };
  storage: { activeProviderId: string | null };
  backup: { enabled: boolean };
}
export interface FileType { id: string; name: string; openStrategy: string; order: number; createdAt: string; updatedAt: string }
export interface CollectionLabel { id: string; collectionId: string; value: string; order: number; createdAt: string; updatedAt: string }
export interface Collection { id: string; name: string; order: number; labels: CollectionLabel[]; createdAt: string; updatedAt: string }
