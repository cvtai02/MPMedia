export interface AppSettings {
  [key: string]: unknown;
  cachePath?: string;
  maxCacheSizeMb?: number;
  defaultStorageProvider?: string;
}
