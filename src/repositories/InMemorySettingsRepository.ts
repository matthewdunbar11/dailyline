import type { UserSettings } from '../types/settings';
import { getDefaultSettings } from '../types/settings';
import type { SettingsRepository } from './SettingsRepository';

export const createInMemorySettingsRepository = (
  seed: UserSettings = getDefaultSettings()
): SettingsRepository => {
  let settings = { ...seed };

  return {
    async getSettings() {
      return { ...settings };
    },
    async updateSettings(update: Partial<UserSettings>) {
      settings = { ...settings, ...update };
      return { ...settings };
    },
    async setSettings(nextSettings: UserSettings) {
      settings = { ...nextSettings };
    }
  };
};
