const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

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
export const login = (token: string) =>
  request<{ accessToken: string }>('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ token }),
  });
export const getMe = () => request<Admin>('/api/auth/me');

// Media
export const listMedia = (params: Record<string, string | number | boolean>) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== false).map(([k, v]) => [k, String(v)]))
  ).toString();
  return request<PaginatedMedia>(`/api/media${q ? `?${q}` : ''}`);
};
export const getMedia = (id: string) => request<MediaDetail>(`/api/media/${id}`);
export const uploadMedia = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<MediaDetail>('/api/media/upload', { method: 'POST', body: form });
};
export const updateMedia = (id: string, body: { originalName: string }) =>
  request<MediaItem>(`/api/media/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteMedia = (id: string) => request<void>(`/api/media/${id}`, { method: 'DELETE' });
export const cacheMedia = (id: string) => request<MediaDetail>(`/api/media/${id}/cache`, { method: 'POST' });
export const clearCache = (id: string) => request<MediaItem>(`/api/media/${id}/cache`, { method: 'DELETE' });
export const assignCollectionLabel = (mediaId: string, collectionLabelId: string) =>
  request<MediaItem>(`/api/media/${mediaId}/collection-labels/${collectionLabelId}`, { method: 'POST' });
export const removeCollectionLabel = (mediaId: string, collectionLabelId: string) =>
  request<MediaItem>(`/api/media/${mediaId}/collection-labels/${collectionLabelId}`, { method: 'DELETE' });


// Admins
export const listAdmins = () => request<Admin[]>('/api/admins');
export const createAdmin = (body: { email: string; password: string; displayName?: string; role: string }) =>
  request<Admin>('/api/admins', { method: 'POST', body: JSON.stringify(body) });
export const updateAdmin = (id: string, body: { displayName?: string; isActive?: boolean }) =>
  request<Admin>(`/api/admins/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteAdmin = (id: string) => request<void>(`/api/admins/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => request<AppSettings>('/api/settings');
export const updateSettings = (body: Partial<AppSettings>) =>
  request<AppSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(body) });

// File Types
export const listFileTypes = () => request<FileType[]>('/api/file-types');
export const createFileType = (name: string, order?: number, openStrategy?: string) =>
  request<FileType>('/api/file-types', { method: 'POST', body: JSON.stringify({ name, order, openStrategy }) });
export const updateFileType = (id: string, patch: { name?: string; order?: number; openStrategy?: string }) =>
  request<FileType>(`/api/file-types/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteFileType = (id: string) => request<void>(`/api/file-types/${id}`, { method: 'DELETE' });

// Collections
export const listCollections = () => request<Collection[]>('/api/collections');
export const createCollection = (name: string, order?: number) =>
  request<Collection>('/api/collections', { method: 'POST', body: JSON.stringify({ name, order }) });
export const updateCollection = (id: string, patch: { name?: string; order?: number }) =>
  request<Collection>(`/api/collections/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteCollection = (id: string) => request<void>(`/api/collections/${id}`, { method: 'DELETE' });
export const createCollectionLabel = (collectionId: string, value: string, order?: number) =>
  request<CollectionLabel>(`/api/collections/${collectionId}/labels`, { method: 'POST', body: JSON.stringify({ value, order }) });
export const updateCollectionLabel = (collectionId: string, labelId: string, patch: { value?: string; order?: number }) =>
  request<CollectionLabel>(`/api/collections/${collectionId}/labels/${labelId}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteCollectionLabel = (collectionId: string, labelId: string) =>
  request<void>(`/api/collections/${collectionId}/labels/${labelId}`, { method: 'DELETE' });

// Unlabeled
export const getUnlabeled = () => request<UnlabeledFilesResult>('/api/unlabeled');

// Router Settings
export const getRouterSettings = () => request<RouterSettings>('/api/router-settings');
export const updateRouterSettings = (body: Partial<Pick<RouterSettings, 'accessToken' | 'basePath'>>) =>
  request<RouterSettings>('/api/router-settings', { method: 'PATCH', body: JSON.stringify(body) });

// Types
export interface CollectionLabelRef { id: string; collectionId: string; collectionName: string; value: string }
export interface FileTypeRef { id: string; name: string; openStrategy: string }
export interface MediaItem {
  id: string; originalName: string; mimeType: string; mediaType: string;
  sizeBytes: number; checksum: string; status: string;
  fileType: FileTypeRef | null;
  collectionLabels: CollectionLabelRef[]; createdAt: string; updatedAt: string;
}
export interface MediaFile {
  id: string; routerPath: string; cdnUrl: string | null;
  isPrimary: boolean; isCached: boolean; localCachePath: string | null;
}
export interface MediaDetail extends MediaItem { files: MediaFile[] }
export interface PaginatedMedia { data: MediaItem[]; total: number; page: number; limit: number }
export interface Admin {
  id: string; email: string; displayName: string | null; role: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}
export interface AppSettings {
  cache: { enabled: boolean; path: string; maxSizeMb: number };
  backup: { enabled: boolean };
}
export interface FileType { id: string; name: string; openStrategy: string; order: number; createdAt: string; updatedAt: string }
export interface CollectionLabel { id: string; collectionId: string; value: string; order: number; createdAt: string; updatedAt: string }
export interface Collection { id: string; name: string; order: number; labels: CollectionLabel[]; createdAt: string; updatedAt: string }
export interface RouterSettings { id: string; accessToken: string; basePath: string; createdAt: string; updatedAt: string }
export interface UnlabeledFileItem {
  absolutePath: string; name: string; sizeBytes: number; cdnUrl: string | null; tracked: boolean;
  mediaItem: { id: string; originalName: string; mimeType: string; mediaType: string; status: string } | null;
}
export interface UnlabeledFilesResult { total: number; items: UnlabeledFileItem[] }
