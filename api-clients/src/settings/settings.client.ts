import { BaseApiClient } from '../shared/base.client';
import { AppSettings } from './settings.types';

export class SettingsClient extends BaseApiClient {
  getSettings(): Promise<AppSettings> { return this.get<AppSettings>('/settings'); }
  update(body: Partial<AppSettings>): Promise<AppSettings> { return this.patch<AppSettings>('/settings', body); }
  reload(): Promise<void> { return this.post<void>('/settings/reload'); }
}
