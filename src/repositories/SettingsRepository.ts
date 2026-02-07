import type { UserSettings } from '../types/settings';

export type SettingsRepository = {
  getSettings(): Promise<UserSettings>;
  updateSettings(update: Partial<UserSettings>): Promise<UserSettings>;
  setSettings(settings: UserSettings): Promise<void>;
};
