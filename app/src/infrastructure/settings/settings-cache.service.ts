import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

export interface AppSettings {
  cache: {
    enabled: boolean;
    path: string;
    maxSizeMb: number;
  };
  storage: {
    activeProviderId: string | null;
  };
  backup: {
    enabled: boolean;
  };
}

const DEFAULTS: AppSettings = {
  cache: { enabled: true, path: '.local-cache/media', maxSizeMb: 1024 },
  storage: { activeProviderId: null },
  backup: { enabled: false },
};

type SettingsGroup = keyof AppSettings;

@Injectable()
export class SettingsCacheService implements OnModuleInit {
  private readonly settingsPath = resolve(process.cwd(), 'config', 'app-settings.local.json');
  private settings: AppSettings = structuredClone(DEFAULTS);

  async onModuleInit() {
    await this.load();
  }

  getAll(): AppSettings {
    return structuredClone(this.settings);
  }

  get<G extends SettingsGroup>(group: G): AppSettings[G] {
    return structuredClone(this.settings[group]);
  }

  async update(patch: DeepPartial<AppSettings>): Promise<AppSettings> {
    const merged = deepMerge(this.settings, patch);

    await mkdir(dirname(this.settingsPath), { recursive: true });
    await writeFile(this.settingsPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    this.settings = merged;
    return this.getAll();
  }

  async reload(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const loaded = structuredClone(DEFAULTS);

    try {
      const raw = await readFile(this.settingsPath, 'utf8');
      const parsed = JSON.parse(raw) as DeepPartial<AppSettings>;
      for (const group of Object.keys(parsed) as SettingsGroup[]) {
        if (group in loaded) {
          mergeSettingsGroup(loaded, group, parsed[group]);
        }
      }
    } catch {
      await mkdir(dirname(this.settingsPath), { recursive: true });
      await writeFile(this.settingsPath, `${JSON.stringify(loaded, null, 2)}\n`, 'utf8');
    }

    this.settings = loaded;
  }
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function mergeSettingsGroup<G extends SettingsGroup>(
  settings: AppSettings,
  group: G,
  patch: DeepPartial<AppSettings[G]> | undefined,
): void {
  if (patch !== undefined) {
    settings[group] = deepMerge(settings[group], patch);
  }
}

function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = structuredClone(base);
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const patchVal = patch[key];
    if (patchVal !== undefined && patchVal !== null && typeof patchVal === 'object' && !Array.isArray(patchVal)) {
      (result[key] as object) = deepMerge(base[key] as object, patchVal as DeepPartial<object>);
    } else if (patchVal !== undefined) {
      result[key] = patchVal as T[keyof T];
    }
  }
  return result;
}
