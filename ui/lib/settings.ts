import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

export interface ClientTokenPermission {
  path: string;
  access: 'read' | 'write' | 'read-write';
}
export interface ClientToken {
  id: string;
  name: string;
  value: string;
  permissions: ClientTokenPermission[];
}
export interface AppSettings {
  cache: { enabled: boolean; path: string; maxSizeMb: number };
  backup: { enabled: boolean };
  auth: { adminToken: string; clientTokens: ClientToken[] };
}

const DEFAULTS: AppSettings = {
  cache: { enabled: true, path: '.local-cache/media', maxSizeMb: 1024 },
  backup: { enabled: false },
  auth: { adminToken: '', clientTokens: [] },
};

const SETTINGS_PATH = resolve(process.cwd(), 'config', 'app-settings.local.json');

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = structuredClone(base);
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const v = patch[key];
    if (v !== undefined && v !== null && typeof v === 'object' && !Array.isArray(v)) {
      (result[key] as object) = deepMerge(base[key] as object, v as DeepPartial<object>);
    } else if (v !== undefined) {
      result[key] = v as T[keyof T];
    }
  }
  return result;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf8');
    return deepMerge(structuredClone(DEFAULTS), JSON.parse(raw) as DeepPartial<AppSettings>);
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export async function updateSettings(patch: DeepPartial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const merged = deepMerge(current, patch);
  await mkdir(dirname(SETTINGS_PATH), { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  return merged;
}
