export * from './auth';
export * from './media';
export * from './labels';
export * from './storage-providers';
export * from './backups';
export * from './admins';
export * from './settings';
export * from './shared/types';
export { BaseApiClient } from './shared/base.client';

import { BaseApiClient } from './shared/base.client';
import { AuthClient } from './auth';
import { MediaClient } from './media';
import { LabelsClient } from './labels';
import { StorageProvidersClient } from './storage-providers';
import { BackupsClient } from './backups';
import { AdminsClient } from './admins';
import { SettingsClient } from './settings';

export class MpMediaApiClient {
  readonly auth: AuthClient;
  readonly media: MediaClient;
  readonly labels: LabelsClient;
  readonly storageProviders: StorageProvidersClient;
  readonly backups: BackupsClient;
  readonly admins: AdminsClient;
  readonly settings: SettingsClient;

  constructor(baseUrl: string, getToken?: () => string | null) {
    this.auth = new AuthClient(baseUrl, getToken);
    this.media = new MediaClient(baseUrl, getToken);
    this.labels = new LabelsClient(baseUrl, getToken);
    this.storageProviders = new StorageProvidersClient(baseUrl, getToken);
    this.backups = new BackupsClient(baseUrl, getToken);
    this.admins = new AdminsClient(baseUrl, getToken);
    this.settings = new SettingsClient(baseUrl, getToken);
  }
}
