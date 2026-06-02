import { AppSettings } from '../../../../infrastructure/settings/settings-cache.service';

export class SettingsResponseDto implements AppSettings {
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
